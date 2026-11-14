#!/usr/bin/env python3
"""Owner-operated release controller. No SSH, DNS, package or proxy changes.

Install reviewed controller + smoke-http.mjs root-owned in /usr/local/lib/nullworx.
Only render runs without root. All other actions require protected approval files.
"""
import argparse
import datetime as dt
import fcntl
import hashlib
import ipaddress
import json
import os
import platform
import posixpath
import pwd
import re
import shutil
import socket
import stat
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path("/srv/nullworx")
CONFIG = Path("/etc/nullworx/deploy.json")
ORIGIN = "https://nullworx.space"
HERE = Path(__file__).resolve().parent
FEATURED_MODE = "ascii-loop30-direct-permission"
FEATURED_MEDIA = json.loads((HERE / "ascii-featured-media.json").read_text())
FEATURED_FILE = Path("/srv/nullworx-media/ascii/loop30-v2-807bb27e.mp4")
FEATURED_SIZE = 12862251


def media_contract(data):
    mode = data.get("media", "unavailable")
    require(mode in {"unavailable", FEATURED_MODE}, "Unsupported media release mode")
    if mode == FEATURED_MODE:
        require(data.get("featuredMedia") == FEATURED_MEDIA, "Featured media receipt mismatch")
    else:
        require(data.get("featuredMedia") is None, "Unavailable release cannot claim featured media")
    return mode


def verify_hosted_media():
    for path in [FEATURED_FILE.parent.parent, FEATURED_FILE.parent]:
        info = path.lstat()
        require(stat.S_ISDIR(info.st_mode) and info.st_uid == 0 and info.st_mode & 0o022 == 0,
                "Unsafe hosted media directory")
    info = FEATURED_FILE.lstat()
    require(stat.S_ISREG(info.st_mode) and info.st_uid == 0 and info.st_mode & 0o022 == 0,
            "Hosted media must be a regular protected root-owned file")
    require(info.st_size == FEATURED_SIZE and digest(FEATURED_FILE) == FEATURED_MEDIA["sha256"],
            "Hosted media differs from the approved exact video")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads(Path(path).read_text())


def secure_file(path):
    path = Path(path)
    info = path.lstat()
    require(stat.S_ISREG(info.st_mode) and info.st_uid == 0 and info.st_mode & 0o077 == 0,
            f"Must be a regular root-owned file mode 0600 or stricter: {path}")
    return path


def validate_config(config):
    require(re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9.-]*", config["hostname"])
            and "REPLACE" not in config["hostname"], "Set observed hostname -f")
    addresses = [config["publicIPv4"]]
    if config.get("publicIPv6"):
        addresses.append(config["publicIPv6"])
    require(ipaddress.ip_address(addresses[0]).version == 4, "Owner-confirmed public IPv4 required")
    for address in addresses:
        require(ipaddress.ip_address(address).is_global, "Require actual public VPS addresses")
    if len(addresses) == 2:
        require(ipaddress.ip_address(addresses[1]).version == 6, "Invalid IPv6")
    for key in ["productionPort", "stagingPort", "sshPort"]:
        minimum = 1 if key == "sshPort" else 1024
        require(type(config[key]) is int and minimum <= config[key] <= 65535, f"Invalid {key}")
    require(config["productionPort"] != config["stagingPort"], "Ports must differ")
    require(re.fullmatch(r"/[a-zA-Z0-9_./-]+", config["node"]), "Use an absolute root-managed Node path")
    for key in ["memoryBudgetMiBPerInstance", "diskBudgetGiB"]:
        require(type(config[key]) is int and config[key] > 0, f"Set measured {key}")
    require(config["otherAppsHealthEvidence"] and "REPLACE" not in config["otherAppsHealthEvidence"], "Inventory/other-app health receipt required")
    require(config["sshTarget"] and "REPLACE" not in config["sshTarget"], "Exact SSH target required for owner review")
    require(re.fullmatch(r"SHA256:[A-Za-z0-9+/]{43}", config["sshHostKeySha256"]), "Verified SSH host-key fingerprint required")
    require(type(config["cpuQuotaPercentPerInstance"]) is int and 1 <= config["cpuQuotaPercentPerInstance"] <= 100, "Choose a CPU quota leaving room for existing apps")
    return config


def timestamp(value):
    result = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    require(result.tzinfo is not None, "Timestamp must include timezone")
    return result


def approval(path, config, action):
    data = read_json(secure_file(path))
    require(socket.getfqdn() == config["hostname"], "Host differs from approved inventory")
    for key, expected in {"hostname": config["hostname"], "action": action, "domain": ORIGIN,
                          "publicIPv4": config["publicIPv4"], "publicIPv6": config.get("publicIPv6"),
                          "sshTarget": config["sshTarget"], "sshPort": config["sshPort"],
                          "sshHostKeySha256": config["sshHostKeySha256"],
                          "productionPort": config["productionPort"], "stagingPort": config["stagingPort"]}.items():
        require(data.get(key) == expected, f"Approval mismatch: {key}")
    require("media" in data, "Approval requires explicit media mode")
    media_contract(data)
    require(re.fullmatch(r"[a-f0-9]{40}", data.get("commit", "")), "Full commit required")
    require(re.fullmatch(r"[a-f0-9]{64}", data.get("sha256", "")), "Artifact SHA256 required")
    require(data.get("owner") and data.get("authorizationRef") and "REPLACE" not in str(data), "Explicit owner authorization receipt required")
    remaining = (timestamp(data["expiresAt"]) - dt.datetime.now(dt.timezone.utc)).total_seconds()
    require(0 < remaining <= 86400, "Approval expired or expires more than 24h ahead")
    return data


def digest(path):
    with Path(path).open("rb") as file:
        return hashlib.file_digest(file, "sha256").hexdigest()


def atomic_json(path, data):
    temp = path.with_suffix(".new")
    with temp.open("w") as file:
        temp.chmod(0o600)
        file.write(json.dumps(data, indent=2) + "\n")
        file.flush()
        os.fsync(file.fileno())
    os.replace(temp, path)
    sync_directory(path.parent)


def sync_directory(path):
    descriptor = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def run(*args):
    return subprocess.run(args, check=True, text=True, capture_output=True).stdout.strip()


def unit(slot):
    return f"nullworx@{slot}.service"


def pointer(slot):
    link = ROOT / slot
    require(not link.exists() or link.is_symlink(), f"Refusing to replace a directory: {link}")
    if not link.is_symlink():
        return None
    result = link.resolve(strict=True)
    require(result.parent == ROOT / "releases", "Release pointer escapes release directory")
    return result


def link_to(slot, release):
    link = ROOT / slot
    temp = ROOT / f".{slot}.new"
    temp.unlink(missing_ok=True)
    temp.symlink_to(release, target_is_directory=True)
    os.replace(temp, link)
    sync_directory(ROOT)


def restore(slot, old):
    if old:
        link_to(slot, old)
        run("systemctl", "restart", unit(slot))
    else:
        run("systemctl", "stop", unit(slot))
        (ROOT / slot).unlink(missing_ok=True)


def switch(slot, release, verify, verify_old=None):
    old = pointer(slot)
    require(old != release, "This release already occupies the slot")
    journal = ROOT / "state/transaction.json"
    state_file = ROOT / "state/state.json"
    atomic_json(journal, {"slot": slot, "old": old.name if old else None, "new": release.name,
                          "before": read_json(state_file) if state_file.exists() else {}})
    try:
        link_to(slot, release)
        run("systemctl", "restart", unit(slot))
        verify()
    except Exception:
        restore(slot, old)
        if old and verify_old:
            verify_old(old)
        journal.unlink()
        raise
    return old


def manifest(release, config, auth):
    data = read_json(release / "release.json")
    mode = media_contract(auth)
    require("media" in data, "Release manifest requires media mode")
    require(media_contract(data) == mode, "Release manifest mismatch: media")
    if mode == FEATURED_MODE:
        verify_hosted_media()
    for key, value in {"schema": 1, "commit": auth["commit"], "site": ORIGIN, "platform": "linux", "pnpm": "12.15.0", "tests": "passed"}.items():
        require(data.get(key) == value, f"Release manifest mismatch: {key}")
    arch = {"x86_64": "x64", "aarch64": "arm64"}.get(platform.machine())
    require(data.get("arch") == arch and arch is not None, "Builder architecture differs from VPS")
    require(data["node"].split(".")[0] == "24", "Node 24 artifact required")
    require(run(config["node"], "--version") == "v" + data["node"], "VPS Node must match builder Node exactly")
    libc, version = platform.libc_ver()
    require(libc == "glibc" and data.get("glibc"), "glibc runtime required")
    require(tuple(map(int, version.split("."))) >= tuple(map(int, data["glibc"].split("."))), "Builder glibc is newer than VPS; rebuild on compatible Linux")
    require((release / ".next/BUILD_ID").read_text().strip() == data["buildId"], "Build ID mismatch")
    require(digest(release / "pnpm-lock.yaml") == data["lockSha256"], "Lockfile mismatch")
    asset = data["asset"]
    require(asset["path"].startswith("/_next/static/") and ".." not in asset["path"], "Invalid build asset path")
    require(digest(release / ".next/static" / asset["path"].removeprefix("/_next/static/")) == asset["sha256"], "Build asset mismatch")
    return data


def validate_members(members):
    allowed = {".next", "node_modules", "public", "package.json", "pnpm-lock.yaml", "next.config.ts", "release.json", "ops"}
    public_files = {"public/material-wave-a/mineral-study.webp", "public/tools/fin-editor-012.html"}
    for member in members:
        name = posixpath.normpath(member.name)
        require(not name.startswith("/") and name.split("/")[0] in allowed and ".." not in name.split("/"), "Unsafe archive path")
        require(member.isfile() or member.isdir() or member.issym() or member.islnk(), "Special file in archive")
        require(not any(part.startswith(".env") for part in name.split("/")), "Environment file in artifact")
        require(not re.search(r"\.(mp4|webm|mov)$", name, re.I), "Media not cleared for this release mode")
        if name.startswith("public/") and not member.isdir():
            require(name in public_files and member.isfile(), "Unapproved public asset: media, sidecars and derivatives excluded")
        if member.issym() or member.islnk():
            target = posixpath.normpath(posixpath.join(posixpath.dirname(name), member.linkname) if member.issym() else member.linkname)
            require(not member.linkname.startswith("/") and target.split("/")[0] in allowed and ".." not in target.split("/"), "Archive link escapes release")


def unpack(archive, config, auth):
    secure_file(archive)
    require(digest(archive) == auth["sha256"], "Artifact digest differs from owner approval")
    release = ROOT / "releases" / auth["commit"]
    if release.exists():
        require((release / ".artifact-sha256").read_text().strip() == auth["sha256"], "Existing commit has different artifact bytes")
        manifest(release, config, auth)
        return release
    require(sys.version_info >= (3, 12), "Python 3.12+ required for safe tar data filter")
    budget = config["diskBudgetGiB"] * 1024 ** 3
    require(shutil.disk_usage(ROOT).free >= budget, "Insufficient reserved disk headroom")
    temp = Path(tempfile.mkdtemp(prefix=".incoming-", dir=ROOT / "releases"))
    try:
        with tarfile.open(archive, "r:gz") as tar:
            members = tar.getmembers()
            validate_members(members)
            require(sum(m.size for m in members) * 2 < shutil.disk_usage(ROOT).free, "Archive expansion exceeds disk headroom")
            tar.extractall(temp, members=members, filter="data")
        manifest(temp, config, auth)
        # Root owns code; service can write only the Next cache, never source or approvals.
        for directory, dirs, files in os.walk(temp):
            os.chmod(directory, 0o755)
            for name in dirs + files:
                path = Path(directory) / name
                if not path.is_symlink():
                    os.chown(path, 0, 0)
                    path.chmod(0o755 if path.is_dir() or path.stat().st_mode & 0o111 else 0o644)
        cache = temp / ".next/cache"
        if cache.exists():
            shutil.rmtree(cache)
        cache.mkdir()
        account = pwd.getpwnam("nullworx")
        os.chown(cache, account.pw_uid, account.pw_gid)
        cache.chmod(0o700)
        (temp / ".artifact-sha256").write_text(auth["sha256"] + "\n")
        os.rename(temp, release)
    except Exception:
        shutil.rmtree(temp)
        raise
    return release


def smoke(config, slot, auth, profile="origin"):
    release = pointer(slot)
    require(release is not None, "Missing release pointer")
    data = manifest(release, config, auth)
    base = ORIGIN if profile == "edge" else f'http://127.0.0.1:{config[slot + "Port"]}'
    # Wait only for readiness; a failed strict suite is never retried into a green result.
    for attempt in range(15):
        try:
            with urllib.request.urlopen(base + "/", timeout=2) as response:
                if response.status == 200:
                    break
        except OSError:
            pass
        if attempt == 14:
            raise ValueError("Service did not become ready")
        time.sleep(1)
    result = subprocess.run([config["node"], str(HERE / "smoke-http.mjs"), "--base-url", base,
                                 "--profile", profile, "--media", data["media"], "--commit", auth["commit"], "--digest", auth["sha256"],
                                 "--asset-path", data["asset"]["path"], "--asset-sha256", data["asset"]["sha256"]],
                            text=True, capture_output=True, timeout=420)
    print(result.stdout)
    require(result.returncode == 0, "Production smoke failed:\n" + result.stdout + result.stderr)


def validate_report(path, suite, config, auth, data, edge=False):
    report = read_json(secure_file(path))
    expected_base = ORIGIN if edge else f'http://127.0.0.1:{config["stagingPort"]}'
    for key, expected in {"schema": 1, "suite": suite, "passed": True, "commit": auth["commit"], "digest": auth["sha256"], "baseUrl": expected_base}.items():
        require(report.get(key) == expected, f"Smoke report mismatch: {key}")
    require(report.get("checks") and all(c.get("passed") is True for c in report["checks"]), "Report has failed/empty checks")
    mode = media_contract(data)
    if mode == FEATURED_MODE:
        require(report.get("media") == mode and report.get("featuredMedia") == FEATURED_MEDIA,
                "Smoke report not bound to featured media receipt")
    else:
        require(report.get("media", "unavailable") == "unavailable" and report.get("featuredMedia") is None,
                "Smoke report media differs from unavailable release")
    # Require the entire current suite, not just a caller-supplied passed flag.
    legacy = auth["commit"] == "697468992c453c9ca9ed93862f35b3089dc67acb"
    pages = ["/", "/effects"] + ["/effects/" + slug for slug in ["magnetic-focus", "glyph-morph", "prism-text", "ascii-waves", "digital-wake", "ashfall-type", "seam-erosion", "sediment-reveal"]]
    # Additive Visual Frontier gates. Retain exact historical rollback profiles.
    frontier = auth["commit"] not in {
        "697468992c453c9ca9ed93862f35b3089dc67acb",
        "3f6e6360f0686106886f0bb3f6d2d7303d11ea36",
        "54f7716335468bf171e374278b11bdf946f7a651",
        "7db32651b8226b21851dd3480db9dd688e50b267",
    }
    if frontier:
        pages += ["/effects/refractive-type", "/effects/impossible-material"]
    if not legacy:
        pages += ["/kits/bento-duo", "/drops", "/about", "/privacy", "/licenses"]
    names = {c["name"] for c in report["checks"]}
    if suite == "browser":
        expected = {"mobile " + path for path in pages} | {"navigation home to gallery to effect"}
        if not legacy:
            expected |= {"published Bento Duo checkout", "support destinations", "disabled Drops"}
        if frontier:
            expected |= {"visual frontier " + variant for variant in ["A1", "A2", "C1", "C2", "complete source"]}
        expected.add("missing media /effects/sediment-reveal")
        if mode == FEATURED_MODE:
            expected |= {"featured media failure fallback " + path for path in ["/", "/effects/ascii-waves"]}
            expected |= {"featured fish " + label for label in ["mobile", "desktop", "reduced motion"]}
        else:
            expected |= {"procedural ASCII fallback /", "procedural ASCII fallback /effects/ascii-waves"}
        if not edge:
            expected.add("missing media /effects/digital-wake")
    else:
        expected = {"page " + path for path in pages} | {"sitemap", "robots", "release asset"} | {"noindex " + path for path in ["/lab/forge-factory-01", "/effects/nullworx-missing-effect", "/nullworx-smoke-missing-page"]}
        if mode == FEATURED_MODE:
            expected |= {"featured media HEAD", "featured media Range", "featured media checksum", "unpublished media paths"}
        require(report.get("asset") == data["asset"], "Report not bound to release asset")
    require(expected <= names, "Incomplete smoke report")
    age = (dt.datetime.now(dt.timezone.utc) - timestamp(report["checkedAt"])).total_seconds()
    require(0 <= age <= 86400, "Smoke report stale or from the future")
    return digest(path)


def verify_restored(config, slot, old):
    if old:
        prior = read_json(old / "release.json")
        prior_auth = {"commit": old.name, "sha256": (old / ".artifact-sha256").read_text().strip(),
                      "media": prior["media"], "featuredMedia": prior.get("featuredMedia")}
        smoke(config, slot, prior_auth)


def render(config, output):
    validate_config(config)
    output.mkdir(mode=0o700)
    (output / "deploy.json").write_text(json.dumps(config, indent=2) + "\n")
    service = (HERE / "nullworx@.service.in").read_text().replace("@NODE@", config["node"])
    service = service.replace("Restart=on-failure", f'MemoryMax={config["memoryBudgetMiBPerInstance"]}M\nCPUQuota={config["cpuQuotaPercentPerInstance"]}%\nCPUWeight=25\nIOWeight=25\nTasksMax=512\nRestart=on-failure')
    (output / "nullworx@.service").write_text(service)
    for slot in ["production", "staging"]:
        (output / f"{slot}.env").write_text(f'PORT={config[slot + "Port"]}\nNEXT_PUBLIC_SITE_URL={ORIGIN}\n')
    (output / "nullworx.caddy").write_text((HERE / "Caddyfile.in").read_text().replace("@PRODUCTION_PORT@", str(config["productionPort"])))
    dns = f'@ A {config["publicIPv4"]}\nwww CNAME nullworx.space.\n'
    dns += f'# Conditional after IPv6 80/443 and TLS verification: @ AAAA {config["publicIPv6"]}\n' if config.get("publicIPv6") else "# No AAAA: IPv6 unverified. Remove stale conflicting AAAA only with exact-record owner approval.\n"
    (output / "dns-plan.txt").write_text(dns + "# Proposal only. Review existing records, MX/TXT/CAA, TTL and rollback before applying.\n")
    for file in output.iterdir():
        file.chmod(0o600)
    print(f"Rendered reviewable configuration in {output}; nothing installed")


def execute(args, config, auth, state):
    action = args.command
    if action == "stage":
        release = unpack(args.archive, config, auth)
        switch("staging", release, lambda: smoke(config, "staging", auth), lambda old: verify_restored(config, "staging", old))
        state["staged"] = {"commit": auth["commit"], "sha256": auth["sha256"]}
        state.pop("attested", None)
    elif action == "attest":
        require(state.get("staged") == {"commit": auth["commit"], "sha256": auth["sha256"]}, "Stage this artifact first")
        data = manifest(pointer("staging"), config, auth)
        hashes = [validate_report(args.http_report, "http", config, auth, data), validate_report(args.browser_report, "browser", config, auth, data)]
        smoke(config, "staging", auth)
        state["attested"] = {"commit": auth["commit"], "sha256": auth["sha256"], "reportHashes": hashes, "at": dt.datetime.now(dt.timezone.utc).isoformat()}
    elif action == "activate":
        require(not state.get("production") or state["production"].get("verifiedEdge"), "Finalize or roll back the pending production release first")
        attested = state.get("attested", {})
        require(attested.get("commit") == auth["commit"] and attested.get("sha256") == auth["sha256"], "Exact artifact needs staging and browser attestation")
        require(0 <= (dt.datetime.now(dt.timezone.utc) - timestamp(attested["at"])).total_seconds() <= 86400, "Staging attestation expired")
        release = pointer("staging")
        manifest(release, config, auth)
        smoke(config, "staging", auth)
        old = switch("production", release, lambda: smoke(config, "production", auth), lambda old: verify_restored(config, "production", old))
        state["beforeActivation"] = {key: state.get(key) for key in ["production", "previous"]}
        state["previous"] = old.name if old else None
        state["production"] = {"commit": auth["commit"], "sha256": auth["sha256"], "verifiedEdge": False}
    elif action == "finalize":
        current = state.get("production") or {}
        require(current.get("commit") == auth["commit"] and current.get("sha256") == auth["sha256"], "Production artifact differs")
        require(current.get("verifiedEdge") is False and "beforeActivation" in state, "No pending activation or rollback to finalize")
        try:
            expected_ips = {config["publicIPv4"], config.get("publicIPv6")} - {None}
            for host in ["nullworx.space", "www.nullworx.space"]:
                observed = {item[4][0] for item in socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)}
                require(observed and observed <= expected_ips, f"DNS {host} does not exclusively identify the approved VPS")
            data = manifest(pointer("production"), config, auth)
            validate_report(args.browser_report, "browser", config, auth, data, edge=True)
            smoke(config, "production", auth, profile="edge")
        except Exception:
            old = ROOT / "releases" / state["previous"] if state.get("previous") else None
            # A crash during restoration must remain recoverable, including a failed first launch.
            prior = {**state, **state["beforeActivation"]}
            prior.pop("beforeActivation", None)
            atomic_json(ROOT / "state/transaction.json", {"slot": "production", "old": old.name if old else None,
                                                         "new": auth["commit"], "before": prior})
            restore("production", old)
            verify_restored(config, "production", old)
            state.update(state.pop("beforeActivation"))
            atomic_json(ROOT / "state/state.json", state)
            (ROOT / "state/transaction.json").unlink()
            raise
        state["production"]["verifiedEdge"] = True
        state.pop("beforeActivation", None)
    elif action == "rollback":
        require(state.get("previous") == auth["commit"], "Rollback target must be the retained previous production release")
        release = ROOT / "releases" / auth["commit"]
        require((release / ".artifact-sha256").read_text().strip() == auth["sha256"], "Rollback digest mismatch")
        manifest(release, config, auth)
        old = switch("production", release, lambda: smoke(config, "production", auth), lambda old: verify_restored(config, "production", old))
        state["beforeActivation"] = {key: state.get(key) for key in ["production", "previous"]}
        state["previous"] = old.name if old else None
        state["production"] = {"commit": auth["commit"], "sha256": auth["sha256"], "verifiedEdge": False}
    state["lastAuthorizationRef"] = auth["authorizationRef"]
    atomic_json(ROOT / "state/state.json", state)
    (ROOT / "state/transaction.json").unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    renderer = sub.add_parser("render", help="Local only; render reviewed files without installing")
    renderer.add_argument("target", type=Path)
    renderer.add_argument("output", type=Path)
    for action in ["stage", "attest", "activate", "finalize", "rollback", "recover"]:
        command = sub.add_parser(action)
        command.add_argument("--approval", required=True, type=Path)
        if action == "stage":
            command.add_argument("--archive", required=True, type=Path)
        if action == "attest":
            command.add_argument("--http-report", required=True, type=Path)
        if action in ["attest", "finalize"]:
            command.add_argument("--browser-report", required=True, type=Path)
    args = parser.parse_args()
    if args.command == "render":
        render(read_json(args.target), args.output)
        return
    require(os.geteuid() == 0, "Run through owner-controlled sudo; never give the service account sudo access")
    os.umask(0o077)
    config = validate_config(read_json(secure_file(CONFIG)))
    for path in [ROOT, ROOT / "releases", ROOT / "state"]:
        info = path.lstat()
        require(stat.S_ISDIR(info.st_mode) and info.st_uid == 0 and info.st_mode & 0o022 == 0, f"Unsafe controller directory: {path}")
    with (ROOT / "state/deploy.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        expected_action = "stage" if args.command == "attest" else args.command
        if args.command == "finalize":
            expected_action = read_json(secure_file(args.approval)).get("action")
            require(expected_action in {"activate", "rollback"}, "Finalization requires the activation or rollback authorization")
        auth = approval(args.approval, config, expected_action)
        journal = ROOT / "state/transaction.json"
        if args.command == "recover":
            transaction = read_json(secure_file(journal))
            expected = transaction["old"] or transaction["new"]
            require(auth["commit"] == expected, "Recovery must name the pre-switch release (or stopped first release)")
            release = ROOT / "releases" / expected
            require((release / ".artifact-sha256").read_text().strip() == auth["sha256"], "Recovery digest mismatch")
            manifest(release, config, auth)
            restore(transaction["slot"], release if transaction["old"] else None)
            verify_restored(config, transaction["slot"], release if transaction["old"] else None)
            atomic_json(ROOT / "state/state.json", transaction["before"])
            journal.unlink()
            print(f"PASS recovered {transaction['slot']} to {transaction['old'] or 'stopped'}")
            return
        require(not journal.exists(), "Interrupted switch: inspect state/transaction.json, then run recover with exact-target owner approval")
        state_path = ROOT / "state/state.json"
        state = read_json(secure_file(state_path)) if state_path.exists() else {}
        execute(args, config, auth, state)
    print(f"PASS {args.command}: {auth['commit']} on {config['hostname']}")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, subprocess.SubprocessError) as error:
        sys.exit(f"REFUSED/FAILED: {error}")
