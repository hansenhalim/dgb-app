const VARIANT = process.env.APP_VARIANT ?? "development";

const variants = {
  development: {
    name: "DGB (Dev)",
    package: "local.dgb",
    backgroundColor: "#FDE7E9",
    backgroundImage: null,
  },
  staging: {
    name: "DGB (Staging)",
    package: "id.my.hann.dgb",
    backgroundColor: "#FFF3CD",
    backgroundImage: null,
  },
  production: {
    name: "DGB",
    package: "com.p3villacitra.dgb",
    backgroundColor: "#E6F4FE",
    backgroundImage: "./assets/images/android-icon-background.png",
  },
};

const v = variants[VARIANT] ?? variants.development;

export default {
  expo: {
    name: v.name,
    slug: "dgb-app",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "dgbapp",
    userInterfaceStyle: "automatic",
    android: {
      adaptiveIcon: {
        backgroundColor: v.backgroundColor,
        foregroundImage: "./assets/images/android-icon-foreground.png",
        ...(v.backgroundImage && { backgroundImage: v.backgroundImage }),
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      package: v.package,
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 76,
          },
        },
      ],
      "expo-secure-store",
      "expo-image",
      [
        "expo-camera",
        {
          cameraPermission:
            "Izinkan $(PRODUCT_NAME) mengakses kamera untuk foto KTP/SIM.",
          recordAudioAndroid: false,
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: "36.0.0",
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            enableBundleCompression: true,
            buildArchs: ["arm64-v8a"],
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "6668960c-e087-49a7-988d-a0d71202c133",
      },
    },
  },
};
