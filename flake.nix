{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
  in {
    devShell.${system} = pkgs.mkShell {
      buildInputs = [
        pkgs.llvmPackages.lld

        # Local web server
        pkgs.static-web-server

        # Wasm devtools
        pkgs.binaryen
        pkgs.wabt

        # Type-checking tool
        pkgs.typescript
      ];

      CC_WASM = "${pkgs.llvmPackages.clang.cc}/bin/clang";
    };
  };
}
