{ self, ... }:
{ pkgs, lib, ... }:

{
  config = {
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
