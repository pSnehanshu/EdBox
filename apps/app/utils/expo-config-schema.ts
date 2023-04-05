// These schemas were generated using https://transform.tools/typescript-to-zod

import { z } from "zod";

export const splashSchema = z.record(z.any()).and(
  z.object({
    backgroundColor: z.string().optional(),
    resizeMode: z.union([z.literal("cover"), z.literal("contain")]).optional(),
    image: z.string().optional(),
  }),
);

export const androidIntentFiltersDataSchema = z.object({
  scheme: z.string().optional(),
  host: z.string().optional(),
  port: z.string().optional(),
  path: z.string().optional(),
  pathPattern: z.string().optional(),
  pathPrefix: z.string().optional(),
  mimeType: z.string().optional(),
});

export const webSchema = z.record(z.any()).and(
  z.object({
    favicon: z.string().optional(),
    name: z.string().optional(),
    shortName: z.string().optional(),
    lang: z.string().optional(),
    scope: z.string().optional(),
    themeColor: z.string().optional(),
    description: z.string().optional(),
    dir: z
      .union([z.literal("auto"), z.literal("ltr"), z.literal("rtl")])
      .optional(),
    display: z
      .union([
        z.literal("fullscreen"),
        z.literal("standalone"),
        z.literal("minimal-ui"),
        z.literal("browser"),
      ])
      .optional(),
    startUrl: z.string().optional(),
    orientation: z
      .union([
        z.literal("any"),
        z.literal("natural"),
        z.literal("landscape"),
        z.literal("landscape-primary"),
        z.literal("landscape-secondary"),
        z.literal("portrait"),
        z.literal("portrait-primary"),
        z.literal("portrait-secondary"),
      ])
      .optional(),
    backgroundColor: z.string().optional(),
    barStyle: z
      .union([
        z.literal("default"),
        z.literal("black"),
        z.literal("black-translucent"),
      ])
      .optional(),
    preferRelatedApplications: z.boolean().optional(),
    dangerous: z.record(z.any()).optional(),
    splash: z
      .record(z.any())
      .and(
        z.object({
          backgroundColor: z.string().optional(),
          resizeMode: z
            .union([z.literal("cover"), z.literal("contain")])
            .optional(),
          image: z.string().optional(),
        }),
      )
      .optional(),
    config: z
      .record(z.any())
      .and(
        z.object({
          firebase: z
            .record(z.any())
            .and(
              z.object({
                apiKey: z.string().optional(),
                authDomain: z.string().optional(),
                databaseURL: z.string().optional(),
                projectId: z.string().optional(),
                storageBucket: z.string().optional(),
                messagingSenderId: z.string().optional(),
                appId: z.string().optional(),
                measurementId: z.string().optional(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    bundler: z.union([z.literal("webpack"), z.literal("metro")]).optional(),
  }),
);

export const publishHookSchema = z.record(z.any()).and(
  z.object({
    file: z.string().optional(),
    config: z.record(z.any()).optional(),
  }),
);

export const runtimeVersionPolicySchema = z.union([
  z.literal("sdkVersion"),
  z.literal("nativeVersion"),
  z.literal("appVersion"),
]);

export const iosSchema = z.object({
  publishManifestPath: z.string().optional(),
  publishBundlePath: z.string().optional(),
  bundleIdentifier: z.string().optional(),
  buildNumber: z.string().optional(),
  backgroundColor: z.string().optional(),
  icon: z.string().optional(),
  merchantId: z.string().optional(),
  appStoreUrl: z.string().optional(),
  bitcode: z.union([z.boolean(), z.string()]).optional(),
  config: z
    .object({
      branch: z
        .object({
          apiKey: z.string().optional(),
        })
        .optional(),
      usesNonExemptEncryption: z.boolean().optional(),
      googleMapsApiKey: z.string().optional(),
      googleMobileAdsAppId: z.string().optional(),
      googleMobileAdsAutoInit: z.boolean().optional(),
      googleSignIn: z
        .object({
          reservedClientId: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  googleServicesFile: z.string().optional(),
  supportsTablet: z.boolean().optional(),
  isTabletOnly: z.boolean().optional(),
  requireFullScreen: z.boolean().optional(),
  userInterfaceStyle: z
    .union([z.literal("light"), z.literal("dark"), z.literal("automatic")])
    .optional(),
  infoPlist: z.record(z.any()).optional(),
  entitlements: z.record(z.any()).optional(),
  associatedDomains: z.array(z.string()).optional(),
  usesIcloudStorage: z.boolean().optional(),
  usesAppleSignIn: z.boolean().optional(),
  accessesContactNotes: z.boolean().optional(),
  splash: z
    .record(z.any())
    .and(
      z.object({
        xib: z.string().optional(),
        backgroundColor: z.string().optional(),
        resizeMode: z
          .union([z.literal("cover"), z.literal("contain")])
          .optional(),
        image: z.string().optional(),
        tabletImage: z.string().optional(),
      }),
    )
    .optional(),
  jsEngine: z.union([z.literal("hermes"), z.literal("jsc")]).optional(),
  runtimeVersion: z
    .union([
      z.string(),
      z.object({
        policy: runtimeVersionPolicySchema,
      }),
    ])
    .optional(),
});

export const androidSchema = z.object({
  publishManifestPath: z.string().optional(),
  publishBundlePath: z.string().optional(),
  package: z.string().optional(),
  versionCode: z.number().optional(),
  backgroundColor: z.string().optional(),
  userInterfaceStyle: z
    .union([z.literal("light"), z.literal("dark"), z.literal("automatic")])
    .optional(),
  useNextNotificationsApi: z.boolean().optional(),
  icon: z.string().optional(),
  adaptiveIcon: z
    .object({
      foregroundImage: z.string().optional(),
      backgroundImage: z.string().optional(),
      backgroundColor: z.string().optional(),
    })
    .optional(),
  playStoreUrl: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  blockedPermissions: z.array(z.string()).optional(),
  googleServicesFile: z.string().optional(),
  config: z
    .object({
      branch: z
        .object({
          apiKey: z.string().optional(),
        })
        .optional(),
      googleMaps: z
        .object({
          apiKey: z.string().optional(),
        })
        .optional(),
      googleMobileAdsAppId: z.string().optional(),
      googleMobileAdsAutoInit: z.boolean().optional(),
      googleSignIn: z
        .object({
          apiKey: z.string().optional(),
          certificateHash: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  splash: z
    .record(z.any())
    .and(
      z.object({
        backgroundColor: z.string().optional(),
        resizeMode: z
          .union([
            z.literal("cover"),
            z.literal("contain"),
            z.literal("native"),
          ])
          .optional(),
        image: z.string().optional(),
        mdpi: z.string().optional(),
        hdpi: z.string().optional(),
        xhdpi: z.string().optional(),
        xxhdpi: z.string().optional(),
        xxxhdpi: z.string().optional(),
      }),
    )
    .optional(),
  intentFilters: z
    .array(
      z.object({
        autoVerify: z.boolean().optional(),
        action: z.string(),
        data: z
          .union([
            androidIntentFiltersDataSchema,
            z.array(androidIntentFiltersDataSchema),
          ])
          .optional(),
        category: z.union([z.string(), z.array(z.string())]).optional(),
      }),
    )
    .optional(),
  allowBackup: z.boolean().optional(),
  softwareKeyboardLayoutMode: z
    .union([z.literal("resize"), z.literal("pan")])
    .optional(),
  jsEngine: z.union([z.literal("hermes"), z.literal("jsc")]).optional(),
  runtimeVersion: z
    .union([
      z.string(),
      z.object({
        policy: runtimeVersionPolicySchema,
      }),
    ])
    .optional(),
});

export const expoConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  owner: z.string().optional(),
  currentFullName: z.string().optional(),
  originalFullName: z.string().optional(),
  privacy: z
    .union([z.literal("public"), z.literal("unlisted"), z.literal("hidden")])
    .optional(),
  sdkVersion: z.string().optional(),
  runtimeVersion: z
    .union([
      z.string(),
      z.object({
        policy: runtimeVersionPolicySchema,
      }),
    ])
    .optional(),
  version: z.string().optional(),
  platforms: z
    .array(z.union([z.literal("android"), z.literal("ios"), z.literal("web")]))
    .optional(),
  githubUrl: z.string().optional(),
  orientation: z
    .union([
      z.literal("default"),
      z.literal("portrait"),
      z.literal("landscape"),
    ])
    .optional(),
  userInterfaceStyle: z
    .union([z.literal("light"), z.literal("dark"), z.literal("automatic")])
    .optional(),
  backgroundColor: z.string().optional(),
  primaryColor: z.string().optional(),
  icon: z.string().optional(),
  notification: z
    .object({
      icon: z.string().optional(),
      color: z.string().optional(),
      iosDisplayInForeground: z.boolean().optional(),
      androidMode: z
        .union([z.literal("default"), z.literal("collapse")])
        .optional(),
      androidCollapsedTitle: z.string().optional(),
    })
    .optional(),
  appKey: z.string().optional(),
  androidStatusBar: z
    .object({
      barStyle: z
        .union([z.literal("light-content"), z.literal("dark-content")])
        .optional(),
      backgroundColor: z.string().optional(),
      hidden: z.boolean().optional(),
      translucent: z.boolean().optional(),
    })
    .optional(),
  androidNavigationBar: z
    .object({
      visible: z
        .union([
          z.literal("leanback"),
          z.literal("immersive"),
          z.literal("sticky-immersive"),
        ])
        .optional(),
      barStyle: z
        .union([z.literal("light-content"), z.literal("dark-content")])
        .optional(),
      backgroundColor: z.string().optional(),
    })
    .optional(),
  developmentClient: z
    .object({
      silentLaunch: z.boolean().optional(),
    })
    .optional(),
  scheme: z.string().optional(),
  entryPoint: z.string().optional(),
  extra: z.record(z.any()).optional(),
  packagerOpts: z.record(z.any()).optional(),
  updates: z
    .object({
      enabled: z.boolean().optional(),
      checkAutomatically: z
        .union([z.literal("ON_ERROR_RECOVERY"), z.literal("ON_LOAD")])
        .optional(),
      fallbackToCacheTimeout: z.number().optional(),
      url: z.string().optional(),
      codeSigningCertificate: z.string().optional(),
      codeSigningMetadata: z
        .object({
          alg: z.literal("rsa-v1_5-sha256").optional(),
          keyid: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  locales: z.record(z.union([z.string(), z.record(z.any())])).optional(),
  facebookAppId: z.string().optional(),
  facebookAutoInitEnabled: z.boolean().optional(),
  facebookAutoLogAppEventsEnabled: z.boolean().optional(),
  facebookAdvertiserIDCollectionEnabled: z.boolean().optional(),
  facebookDisplayName: z.string().optional(),
  facebookScheme: z.string().optional(),
  isDetached: z.boolean().optional(),
  detach: z.record(z.any()).optional(),
  assetBundlePatterns: z.array(z.string()).optional(),
  plugins: z
    .array(
      z.union([
        z.string(),
        z.tuple([]),
        z.tuple([z.string()]),
        z.tuple([z.string(), z.any()]),
      ]),
    )
    .optional(),
  splash: splashSchema.optional(),
  jsEngine: z.union([z.literal("hermes"), z.literal("jsc")]).optional(),
  ios: iosSchema.optional(),
  android: androidSchema.optional(),
  web: webSchema.optional(),
  hooks: z
    .object({
      postPublish: z.array(publishHookSchema).optional(),
      postExport: z.array(publishHookSchema).optional(),
    })
    .optional(),
  experiments: z
    .object({
      turboModules: z.boolean().optional(),
    })
    .optional(),
  _internal: z
    .record(z.any())
    .and(
      z.object({
        pluginHistory: z.record(z.any()).optional(),
      }),
    )
    .optional(),
});

export const expoJsonSchema = z.object({
  expo: expoConfigSchema,
});
