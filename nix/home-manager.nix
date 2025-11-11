{ self, ... }:
{
  config,
  pkgs,
  lib,
  ...
}:

let
  inherit (lib) mkIf mkEnableOption;
  inherit (pkgs.stdenv.hostPlatform) system;
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
        ExecStart = lib.getExe self.packages.${system}.default;
      };
    };
  };
}
