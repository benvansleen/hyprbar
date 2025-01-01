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
    in
    {
      packages = eachSystem (
        { pkgs, ... }:
        {
          default = pkgs.callPackage ./nix/package.nix { inherit ags; };
        }
      );

      devShells = eachSystem (
        { system, pkgs }:
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              self.packages.${system}.default.buildInputs
              self.packages.${system}.default.nativeBuildInputs
              self.checks.${system}.pre-commit-check.enabledPackages
              typescript-language-server
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
