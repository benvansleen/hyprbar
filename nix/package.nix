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
    cava
    hyprland
    notifd
    wireplumber
  ];

  runtimeDeps = with pkgs; [
    sysstat
    lm_sensors
    coreutils
    brightnessctl
  ];

  extraPackages =
    astalPackages
    ++ runtimeDeps
    ++ (with pkgs; [
      libadwaita
      nerd-fonts.victor-mono
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

  postFixup =
    let
      notifdPkg = ags.packages.${pkgs.stdenv.hostPlatform.system}.notifd;
      notifdSchemaDir = "${notifdPkg}/share/gsettings-schemas/${notifdPkg.name}/glib-2.0/schemas";
    in
    ''
      wrapProgram $out/bin/${name} \
        --prefix PATH : ${pkgs.lib.makeBinPath runtimeDeps} \
        --prefix GSETTINGS_SCHEMA_DIR : ${notifdSchemaDir}
    '';

  meta.mainProgram = name;
}
