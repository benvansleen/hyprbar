{
  pkgs,
  ags,
  ...
}:

ags.lib.bundle {
  inherit pkgs;
  src = ../.;
  name = "hyprbar";
  entry = "./src";
  extraPackages =
    with pkgs;
    [
      sysstat
      (writeShellScriptBin "ram-usage" ''
        ${procps}/bin/free -m \
          | ${gnugrep}/bin/grep 'Mem' \
          | ${gawk}/bin/awk '{print $2, $3}'
      '')
    ]
    ++ (with ags.packages.${system}; [
      hyprland
    ]);
}
