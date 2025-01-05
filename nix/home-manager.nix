{ self, ... }:
{
  config,
  pkgs,
  lib,
  ...
}:

let
  inherit (lib) mkIf mkEnableOption;
  cfg = config.hyprbar;
in
{
  options.hyprbar = {
    enable = mkEnableOption "hyprbar";
  };

  config = mkIf cfg.enable {
    systemd.user.services.hyprbar = {
      Unit = {
        Description = "Run hyprbar";
      };
      Install = {
        WantedBy = [ "default.target" ];
      };
      Service = {
        ExecStart = lib.getExe self.packages.${pkgs.system}.default;
      };
    };
  };
}
