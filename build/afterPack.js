// electron-builder afterPack hook.
//  • Linux: wrap the binary in a launcher that adds --no-sandbox only when the Chromium
//    sandbox cannot start (AppImage / tar.gz on distros that restrict user namespaces,
//    e.g. Ubuntu 24.04+). The .deb keeps the SUID chrome-sandbox and runs sandboxed.
//  • macOS: ad-hoc sign so unsigned Apple Silicon builds launch.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const LAUNCHER = (bin) => `#!/bin/bash
HERE="$(dirname "$(readlink -f "$0")")"
ARGS=()
SANDBOX="$HERE/chrome-sandbox"
if ! { [ -u "$SANDBOX" ] && [ "$(stat -c %u "$SANDBOX" 2>/dev/null)" = "0" ]; }; then
  if ! unshare --user --map-root-user true >/dev/null 2>&1; then
    ARGS+=(--no-sandbox)
  fi
fi
exec "$HERE/${bin}" "\${ARGS[@]}" "$@"
`;

exports.default = async function afterPack(context) {
    const { electronPlatformName, appOutDir, packager } = context;

    if (electronPlatformName === 'linux') {
        const name = packager.executableName;
        const exe = path.join(appOutDir, name);
        const bin = `${name}.bin`;
        if (!fs.existsSync(path.join(appOutDir, bin))) fs.renameSync(exe, path.join(appOutDir, bin));
        fs.writeFileSync(exe, LAUNCHER(bin), { mode: 0o755 });
    }

    if (electronPlatformName === 'darwin') {
        const app = path.join(appOutDir, `${packager.appInfo.productFilename}.app`);
        execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
    }
};
