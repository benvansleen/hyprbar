{
  system,
  pkgs,
  ags,
  ...
}:

ags.lib.bundle {
  inherit pkgs;
  src = ../.;
  name = "my-hyprbar";
  entry = "app.ts";
  extraPackages =
    with pkgs;
    [
      sysstat
    ]
    ++ (with ags.packages.${system}; [
      hyprland
    ]);
}
