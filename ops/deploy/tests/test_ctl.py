import copy
import datetime as dt
import importlib.util
import hashlib
from types import SimpleNamespace
import json
import os
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("ctl", Path(__file__).parents[1] / "ctl.py")
ctl = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ctl)


class ControllerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "state").mkdir()
        (self.root / "releases").mkdir()
        self.old = self.root / "releases" / ("a" * 40)
        self.new = self.root / "releases" / ("b" * 40)
        self.old.mkdir()
        self.new.mkdir()
        self.root_patch = patch.object(ctl, "ROOT", self.root)
        self.root_patch.start()
        self.config = {"hostname": "vps.test", "publicIPv4": "8.8.8.8", "publicIPv6": None,
                       "sshTarget": "operator@vps.test", "sshPort": 22, "productionPort": 4001,
                       "sshHostKeySha256": "SHA256:" + "A" * 43, "cpuQuotaPercentPerInstance": 50,
                       "stagingPort": 4002, "node": "/opt/nullworx/node/bin/node",
                       "memoryBudgetMiBPerInstance": 512, "diskBudgetGiB": 2, "otherAppsHealthEvidence": "fixture"}
        self.auth = {"commit": "b" * 40, "sha256": "c" * 64}

    def tearDown(self):
        self.root_patch.stop()
        self.temp.cleanup()

    def test_failed_start_restores_only_own_service(self):
        ctl.link_to("production", self.old)
        with patch.object(ctl, "run", side_effect=[RuntimeError("start failure"), ""]) as run:
            with self.assertRaisesRegex(RuntimeError, "start failure"):
                ctl.switch("production", self.new, lambda: None)
        self.assertEqual(ctl.pointer("production"), self.old)
        self.assertEqual(run.call_args_list[-1].args, ("systemctl", "restart", "nullworx@production.service"))
        self.assertFalse((self.root / "state/transaction.json").exists())

    def test_failed_smoke_restores_previous_release(self):
        ctl.link_to("production", self.old)
        with patch.object(ctl, "run"):
            with self.assertRaises(ValueError):
                ctl.switch("production", self.new, lambda: ctl.require(False, "smoke failed"))
        self.assertEqual(ctl.pointer("production"), self.old)

    def test_failed_first_launch_stops_service(self):
        with patch.object(ctl, "run") as run:
            with self.assertRaises(ValueError):
                ctl.switch("production", self.new, lambda: ctl.require(False, "no previous"))
        self.assertFalse((self.root / "production").exists())
        run.assert_called_with("systemctl", "stop", "nullworx@production.service")

    def test_failed_restore_leaves_recovery_journal(self):
        ctl.link_to("production", self.old)
        with patch.object(ctl, "run", side_effect=RuntimeError("systemctl unavailable")):
            with self.assertRaises(RuntimeError):
                ctl.switch("production", self.new, lambda: None)
        journal = ctl.read_json(self.root / "state/transaction.json")
        self.assertEqual(journal["old"], self.old.name)
        self.assertEqual(journal["new"], self.new.name)

    def test_unhealthy_restored_service_keeps_recovery_journal(self):
        ctl.link_to("production", self.old)
        with patch.object(ctl, "run"):
            with self.assertRaisesRegex(ValueError, "restored unhealthy"):
                ctl.switch("production", self.new, lambda: ctl.require(False, "new unhealthy"),
                           lambda old: ctl.require(False, "restored unhealthy"))
        self.assertEqual(ctl.pointer("production"), self.old)
        self.assertTrue((self.root / "state/transaction.json").exists())

    def test_success_retains_journal_until_state_is_committed(self):
        ctl.link_to("production", self.old)
        with patch.object(ctl, "run"):
            self.assertEqual(ctl.switch("production", self.new, lambda: None), self.old)
        self.assertEqual(ctl.pointer("production"), self.new)
        self.assertTrue((self.root / "state/transaction.json").exists())

    def test_refuses_directory_as_pointer(self):
        (self.root / "production").mkdir()
        with self.assertRaisesRegex(ValueError, "directory"):
            ctl.pointer("production")

    def test_rejects_unattested_activation(self):
        args = type("Args", (), {"command": "activate"})()
        with patch.object(ctl, "run") as run:
            with self.assertRaisesRegex(ValueError, "attestation"):
                ctl.execute(args, self.config, self.auth, {})
            run.assert_not_called()

    def test_rejects_wrong_artifact_without_extraction(self):
        archive = self.root / "artifact"
        archive.write_text("not approved bytes")
        with patch.object(ctl, "secure_file", side_effect=lambda p: p):
            with self.assertRaisesRegex(ValueError, "digest"):
                ctl.unpack(archive, self.config, self.auth)

    def test_rejects_builder_glibc_newer_than_vps(self):
        (self.new / "release.json").write_text(json.dumps({
            "schema": 1, "commit": self.auth["commit"], "site": ctl.ORIGIN, "media": "unavailable",
            "platform": "linux", "pnpm": "12.15.0", "tests": "passed", "arch": "x64", "node": "24.20.0", "glibc": "2.43",
        }))
        with patch.object(ctl.platform, "machine", return_value="x86_64"), patch.object(ctl.platform, "libc_ver", return_value=("glibc", "2.39")), patch.object(ctl, "run", return_value="v24.20.0"):
            with self.assertRaisesRegex(ValueError, "newer than VPS"):
                ctl.manifest(self.new, self.config, self.auth)

    def test_rejects_unknown_ports_and_private_ip(self):
        for key, value in [("productionPort", None), ("stagingPort", 4001), ("publicIPv4", "127.0.0.1")]:
            config = copy.deepcopy(self.config)
            config[key] = value
            with self.assertRaises(ValueError):
                ctl.validate_config(config)

    def test_approval_is_bound_to_host_commit_and_action(self):
        approval = {**self.auth, "hostname": "vps.test", "action": "stage", "domain": ctl.ORIGIN,
                    "publicIPv4": self.config["publicIPv4"], "publicIPv6": None, "sshTarget": self.config["sshTarget"], "sshPort": 22,
                    "sshHostKeySha256": self.config["sshHostKeySha256"],
                    "productionPort": 4001, "stagingPort": 4002, "media": "unavailable", "owner": "test-owner",
                    "authorizationRef": "test-receipt", "expiresAt": (dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=1)).isoformat()}
        path = self.root / "approval.json"
        path.write_text(json.dumps(approval))
        with patch.object(ctl, "secure_file", side_effect=lambda p: p), patch.object(ctl.socket, "getfqdn", return_value="other-host"):
            with self.assertRaisesRegex(ValueError, "Host differs"):
                ctl.approval(path, self.config, "stage")
        with patch.object(ctl, "secure_file", side_effect=lambda p: p), patch.object(ctl.socket, "getfqdn", return_value="vps.test"):
            self.assertEqual(ctl.approval(path, self.config, "stage"), approval)
            with self.assertRaisesRegex(ValueError, "action"):
                ctl.approval(path, self.config, "activate")
            approval["expiresAt"] = "2020-01-01T00:00:00Z"
            path.write_text(json.dumps(approval))
            with self.assertRaisesRegex(ValueError, "expired"):
                ctl.approval(path, self.config, "stage")

    def test_archive_rejects_paths_links_secrets_and_media(self):
        for name in ["../../etc/shadow", "/etc/passwd", "node_modules/.env", "public/loop.mp4",
                     "public/media/local/fish-data.json", "public/media/local/fin-motion-012.json",
                     "public/frames/frame-0001.png", "public/disguised-frame.webp"]:
            with self.assertRaises(ValueError):
                ctl.validate_members([tarfile.TarInfo(name)])
        link = tarfile.TarInfo("node_modules/escape")
        link.type = tarfile.SYMTYPE
        link.linkname = "../../../etc"
        with self.assertRaisesRegex(ValueError, "escapes"):
            ctl.validate_members([link])
        link.linkname = ".pnpm/next@16/node_modules/next"
        ctl.validate_members([link])

    def test_empty_forged_report_cannot_attest(self):
        path = self.root / "report.json"
        path.write_text(json.dumps({"schema": 1, "suite": "browser", "passed": True, "commit": self.auth["commit"],
                                    "digest": self.auth["sha256"], "baseUrl": "http://127.0.0.1:4002", "checks": []}))
        with patch.object(ctl, "secure_file", side_effect=lambda p: p):
            with self.assertRaisesRegex(ValueError, "empty"):
                ctl.validate_report(path, "browser", self.config, self.auth, {})

    def test_browser_report_requires_current_routes_and_actual_fallback_names(self):
        pages = ["/", "/effects"] + ["/effects/" + slug for slug in ["magnetic-focus", "glyph-morph", "prism-text", "ascii-waves", "digital-wake", "ashfall-type", "seam-erosion", "sediment-reveal"]] + ["/kits/bento-duo", "/drops", "/about", "/privacy", "/licenses"]
        names = ["mobile " + page for page in pages] + ["navigation home to gallery to effect", "published Bento Duo checkout", "support destinations", "disabled Drops", "procedural ASCII fallback /", "procedural ASCII fallback /effects/ascii-waves", "missing media /effects/sediment-reveal", "missing media /effects/digital-wake"]
        report = {"schema": 1, "suite": "browser", "passed": True, "commit": self.auth["commit"], "digest": self.auth["sha256"], "baseUrl": "http://127.0.0.1:4002", "checkedAt": dt.datetime.now(dt.timezone.utc).isoformat(), "checks": [{"name": name, "passed": True} for name in names]}
        path = self.root / "report.json"
        with patch.object(ctl, "secure_file", side_effect=lambda p: p):
            path.write_text(json.dumps(report))
            self.assertEqual(ctl.validate_report(path, "browser", self.config, self.auth, {}), ctl.digest(path))
            report["checks"] = [check for check in report["checks"] if check["name"] != "published Bento Duo checkout"]
            path.write_text(json.dumps(report))
            with self.assertRaisesRegex(ValueError, "Incomplete"):
                ctl.validate_report(path, "browser", self.config, self.auth, {})

    def test_failed_edge_verification_restores_previous_state(self):
        ctl.link_to("production", self.new)
        old_state = {"production": {"commit": self.old.name, "verifiedEdge": True}, "previous": None}
        state = {"production": {"commit": self.new.name, "sha256": self.auth["sha256"], "verifiedEdge": False}, "previous": self.old.name, "beforeActivation": old_state}
        args = type("Args", (), {"command": "finalize", "browser_report": "absent"})()
        with patch.object(ctl.socket, "getaddrinfo", return_value=[(2, 1, 6, "", ("127.0.0.1", 443))]), patch.object(ctl, "run"), patch.object(ctl, "verify_restored"):
            with self.assertRaisesRegex(ValueError, "DNS"):
                ctl.execute(args, self.config, self.auth, state)
        self.assertEqual(ctl.pointer("production"), self.old)
        self.assertEqual(state["production"], old_state["production"])

    def test_featured_contract_rejects_fabricated_or_substitute_receipts(self):
        media = {"media": ctl.FEATURED_MODE, "featuredMedia": copy.deepcopy(ctl.FEATURED_MEDIA)}
        self.assertEqual(ctl.media_contract(media), ctl.FEATURED_MODE)
        for change in [{"sha256": "0" * 64}, {"receipt": "invented"}, {"licenseBasis": "cc-by"}, {"src": "/media/substitute.mp4"}]:
            changed = copy.deepcopy(media)
            changed["featuredMedia"].update(change)
            with self.assertRaisesRegex(ValueError, "receipt mismatch"):
                ctl.media_contract(changed)
        for invalid in [{"media": "other-video"}, {"media": ctl.FEATURED_MODE}, {"media": "unavailable", "featuredMedia": ctl.FEATURED_MEDIA}]:
            with self.assertRaises(ValueError):
                ctl.media_contract(invalid)

    def test_featured_host_bytes_and_permissions_are_verified(self):
        directory = self.root / "media" / "ascii"
        directory.mkdir(parents=True)
        directory.chmod(0o755)
        directory.parent.chmod(0o755)
        file = directory / "approved.mp4"
        file.write_bytes(b"exact approved bytes")
        file.chmod(0o644)
        actual_lstat = Path.lstat
        def owner_lstat(path):
            info = actual_lstat(path)
            return SimpleNamespace(st_mode=info.st_mode, st_uid=0, st_size=info.st_size)
        with patch.object(ctl, "FEATURED_FILE", file), patch.object(ctl, "FEATURED_SIZE", file.stat().st_size), patch.dict(ctl.FEATURED_MEDIA, sha256=hashlib.sha256(file.read_bytes()).hexdigest()), patch.object(Path, "lstat", owner_lstat):
            ctl.verify_hosted_media()
            file.write_bytes(b"wrong approved bytes")
            with self.assertRaisesRegex(ValueError, "exact video"):
                ctl.verify_hosted_media()
            file.chmod(0o666)
            with self.assertRaisesRegex(ValueError, "protected root-owned"):
                ctl.verify_hosted_media()
            file.unlink()
            file.symlink_to(self.root / "untrusted.mp4")
            with self.assertRaisesRegex(ValueError, "protected root-owned"):
                ctl.verify_hosted_media()

    def test_featured_report_cannot_reuse_fallback_or_wrong_receipt(self):
        pages = ["/", "/effects"] + ["/effects/" + slug for slug in ["magnetic-focus", "glyph-morph", "prism-text", "ascii-waves", "digital-wake", "ashfall-type", "seam-erosion", "sediment-reveal"]] + ["/kits/bento-duo", "/drops", "/about", "/privacy", "/licenses"]
        names = ["mobile " + page for page in pages] + ["navigation home to gallery to effect", "published Bento Duo checkout", "support destinations", "disabled Drops", "featured media failure fallback /", "featured media failure fallback /effects/ascii-waves", "featured fish mobile", "featured fish desktop", "featured fish reduced motion", "missing media /effects/sediment-reveal", "missing media /effects/digital-wake"]
        data = {"media": ctl.FEATURED_MODE, "featuredMedia": copy.deepcopy(ctl.FEATURED_MEDIA)}
        report = {"schema": 1, "suite": "browser", "passed": True, "commit": self.auth["commit"], "digest": self.auth["sha256"], "baseUrl": "http://127.0.0.1:4002", "checkedAt": dt.datetime.now(dt.timezone.utc).isoformat(), "checks": [{"name": name, "passed": True} for name in names], **data}
        path = self.root / "report.json"
        with patch.object(ctl, "secure_file", side_effect=lambda p: p):
            path.write_text(json.dumps(report))
            ctl.validate_report(path, "browser", self.config, self.auth, data)
            report["checks"] = [check for check in report["checks"] if check["name"] != "featured fish desktop"]
            path.write_text(json.dumps(report))
            with self.assertRaisesRegex(ValueError, "Incomplete"):
                ctl.validate_report(path, "browser", self.config, self.auth, data)
            report["featuredMedia"] = {**report["featuredMedia"], "sha256": "0" * 64}
            path.write_text(json.dumps(report))
            with self.assertRaisesRegex(ValueError, "bound to featured media"):
                ctl.validate_report(path, "browser", self.config, self.auth, data)

    def test_restored_unavailable_release_preserves_its_media_contract(self):
        (self.old / "release.json").write_text(json.dumps({"media": "unavailable"}))
        (self.old / ".artifact-sha256").write_text("f" * 64)
        with patch.object(ctl, "smoke") as smoke:
            ctl.verify_restored(self.config, "production", self.old)
            self.assertEqual(smoke.call_args.args[2], {"commit": self.old.name, "sha256": "f" * 64, "media": "unavailable", "featuredMedia": None})

    def test_finalization_is_not_replayed_after_success(self):
        args = type("Args", (), {"command": "finalize"})()
        state = {"production": {"commit": self.auth["commit"], "sha256": self.auth["sha256"], "verifiedEdge": True}}
        with patch.object(ctl, "restore") as restore:
            with self.assertRaisesRegex(ValueError, "No pending"):
                ctl.execute(args, self.config, self.auth, state)
            restore.assert_not_called()

    def test_lock_prevents_concurrent_release(self):
        with (self.root / "state/deploy.lock").open("a") as first, (self.root / "state/deploy.lock").open("a") as second:
            ctl.fcntl.flock(first, ctl.fcntl.LOCK_EX | ctl.fcntl.LOCK_NB)
            with self.assertRaises(BlockingIOError):
                ctl.fcntl.flock(second, ctl.fcntl.LOCK_EX | ctl.fcntl.LOCK_NB)


if __name__ == "__main__":
    unittest.main()
