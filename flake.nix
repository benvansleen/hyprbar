{
  description = "My Awesome Desktop Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    systems.url = "github:nix-systems/default";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    pre-commit-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.nixpkgs-stable.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      ags,
      systems,
      pre-commit-hooks,
    }:
    let
      eachSystem =
        f:
        nixpkgs.lib.genAttrs (import systems) (
          system:
          f {
            inherit system;
            pkgs = nixpkgs.legacyPackages.${system};
          }
        );

      ags-extensions =
        system: with ags.packages.${system}; [
          hyprland
        ];

      extraPackages =
        system: pkgs:
        with pkgs;
        [
          sysstat
        ]
        ++ ags-extensions system;
    in
    {
      packages = eachSystem (
        { system, pkgs }:
        {
          default = ags.lib.bundle {
            inherit pkgs;
            src = ./.;
            name = "my-shell";
            entry = "app.ts";
            extraPackages = extraPackages system pkgs;
          };
        }
      );

      devShells = eachSystem (
        { system, pkgs }:
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              self.checks.${system}.pre-commit-check.enabledPackages
              typescript-language-server

              (ags.packages.${system}.default.override {
                extraPackages = extraPackages system pkgs;
              })
            ];
            shellHook = self.checks.${system}.pre-commit-check.shellHook;
          };
        }
      );

      checks = eachSystem (
        { system, ... }:
        {
          pre-commit-check = pre-commit-hooks.lib.${system}.run {
            src = ./.;
            hooks = {
              prettier.enable = true;
              deadnix.enable = true;
              ripsecrets.enable = true;
              nixfmt-rfc-style.enable = true;
            };
          };
        }
      );
    };
}
