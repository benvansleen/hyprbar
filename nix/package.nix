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
    astal4
    apps
    battery
    mpris
    network
    powerprofiles
    tray
    wireplumber
  ];

  runtimeDeps = with pkgs; [
    sysstat
    lm_sensors
    coreutils
  ];

  extraPackages =
    astalPackages
    ++ runtimeDeps
    ++ (with pkgs; [
      libadwaita
      libsoup_3
    ]);
in
pkgs.stdenv.mkDerivation rec {
  name = "hyprbar";
  src = ../.;

  nativeBuildInputs = with pkgs; [
    wrapGAppsHook3
    gobject-introspection
    makeWrapper
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

  postFixup = ''
    wrapProgram $out/bin/${name} \
      --prefix PATH : ${pkgs.lib.makeBinPath runtimeDeps}
  '';

  meta.mainProgram = name;
}
