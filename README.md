# Transmission add-on for ReadyNAS Duo/NV+ (sparc)

This is a revival of the Transmission add-on originally created by [super-poussin](https://kb.netgear.com/24557/RAIDiator-Third-Party-Add-ons)
and successively by [tarobun](https://community.netgear.com/t5/ReadyNAS-Storage-Apps-Old-Legacy/New-Transmission-2-84-add-on-for-ReadyNAS-Duo-NV-sparc/td-p/888826).

## How to build Transmission

1. Download the [Qemu sparc platform development environment](https://community.netgear.com/t5/ReadyNAS-Storage-Apps-Current/Sparc-platform-development-envrionment-using-Qemu/m-p/720841), extract and run it:

    ```bash
    wget -q https://www.readynas.com/download/development/readynas_compile_environment.qcow.gz
    gunzip readynas_compile_environment.qcow.gz
    qemu-system-sparc -hda readynas_compile_environment.qcow -nographic
    ```

1. Take Transmission sources. GitHub doesn't support anymore SSLv3/TLSv1 and thus we cannot download transmission\'s sources directly from the emulated environment, but you could use another mirror or copy it via `scp` from your host (Samba is too old).
  `scp` will not work out of the box because [SSH disables weak algorithms by default](https://www.openssh.com/legacy.html), but we can enable `diffie-hellman-group1-sha1` and `ssh-rsa` just this time; add the following to your `/etc/ssh/sshd_config` and restart ssh.

    ```
    KexAlgorithms +diffie-hellman-group1-sha1
    HostKeyAlgorithms +ssh-rsa
    ```

    (the emulated environment doesn't support `xz` tarballs either, thus remember to unpack it before you copy it to the emulated environment:

    ```bash
    unxz < transmission-2.94.tar.xz > transmission-2.94.tar
    ```

1. Extract, configure and build.

    This is the hardest part. You need to find prebuilt deb archives or to build the deb packages yourself. I\'ll provide instructions separately.
    We need to statically link to `libevent` and to provide hints to the compiler for the `zlib` library since the package doesn\'t ship a pkg-config file.

    ```bash
    tar xf transmission-2.94.tar
    ./configure --build=sparc-linux target=sparc-linux --disable-nls --enable-lightweight --enable-utp LIBEVENT_LIBS="/usr/lib/libevent.a" ZLIB_CFLAGS=" " ZLIB_LIBS="-lz"
    make -s
    ```

## How to package the extension

1. Download and extract the [ReadyNAS add-ons SDK](https://www.readynas.com/download/addons/addons_sdk.tgz) to the emulated environment:

    ```bash
    wget -q http://www.readynas.com/download/addons/addons_sdk.tgz
    tar zxf addons_sdk.tgz
    ```

1. Copy the `TRANSMISSION` folder into the `addons_sdk` folder with the method you prefer, then copy the following binaries into it and strip any debug symbols:

    ```bash
    cd addons_sdk/TRANSMISSION
    cp ../transmission-2.94/{daemon/transmission-{daemon,remote},utils/transmission-{create,edit,show}} files/etc/frontview/addons/bin/TRANSMISSION/
    strip --strip-debug files/etc/frontview/addons/bin/TRANSMISSION/transmission-*
    ```

1. And then from the same folder, run this command to package it!

    ```bash
    ../bin/build_addon
    ```

## Donate

Donations via [Liberapay](https://liberapay.com/ilpianista) or Bitcoin (1Ph3hFEoQaD4PK6MhL3kBNNh9FZFBfisEH) are always welcomed, _thank you_!

## License

MIT
