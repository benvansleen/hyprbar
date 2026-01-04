{
  pkgs,
  ags,
  ...
}:

let
  astalPackages = with ags.packages.${pkgs.stdenv.hostPlatform.system}; [
    default
    astal4
    battery
    hyprland
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
    ]);
in
pkgs.stdenv.mkDerivation rec {
  name = "hyprbar";
  src = ../.;

  nativeBuildInputs = with pkgs; [
    wrapGAppsHook3
    gobject-introspection
    makeWrapper
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
