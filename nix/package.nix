{
  pkgs,
  ags,
  ...
}:

# ags.lib.bundle {
#   inherit pkgs;
#   src = ../.;
#   name = "hyprbar";
#   entry = "./src";
#   extraPackages =
#     with pkgs;
#     [
#       sysstat
#       lm_sensors
#       (writeShellScriptBin "ram-usage" ''
#         ${procps}/bin/free -m \
#           | ${gnugrep}/bin/grep 'Mem' \
#           | ${gawk}/bin/awk '{print $2, $3}'
#       '')
#     ]
#     ++ (with ags.packages.${pkgs.stdenv.hostPlatform.system}; [
#       hyprland
#     ]);
# }

let
  astalPackages = with ags.packages.${pkgs.stdenv.hostPlatform.system}; [
    io
    astal4 # or astal3 for gtk3
    apps
    battery
    mpris
    network
    powerprofiles
    tray
    wireplumber
    # notifd tray wireplumber
  ];

  extraPackages =
    astalPackages
    ++ (with pkgs; [
      libadwaita
      libsoup_3

      sysstat
      lm_sensors
      (writeShellScriptBin "ram-usage" ''
        ${procps}/bin/free -m \
          | ${gnugrep}/bin/grep 'Mem' \
          | ${gawk}/bin/awk '{print $2, $3}'
      '')
    ]);
in
pkgs.stdenv.mkDerivation rec {
  name = "hyprbar";
  src = ../.;

  nativeBuildInputs = with pkgs; [
    wrapGAppsHook3
    gobject-introspection
    ags.packages.${system}.default
    ags.packages.${system}.hyprland
  ];

  buildInputs = extraPackages ++ [ pkgs.gjs ];

  installPhase = ''
    runHook preInstall

    mkdir -p $out/bin
    mkdir -p $out/share
    cp -r * $out/share
    ags bundle src $out/bin/${name} -d "SRC='$out/share'"

    runHook postInstall
  '';
}
