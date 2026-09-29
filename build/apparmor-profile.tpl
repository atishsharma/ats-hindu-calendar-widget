abi <abi/4.0>,
include <tunables/global>

# The launcher script execs ${executable}.bin (see build/afterPack.js); allow user namespaces for it.
profile "${executable}" "/opt/${sanitizedProductName}/${executable}{,.bin}" flags=(unconfined) {
  userns,

  # Site-specific additions and overrides. See local/README for details.
  include if exists <local/${executable}>
}
