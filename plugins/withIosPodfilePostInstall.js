const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Allows arm64 iOS simulators (Apple Silicon) and silences a deprecated-literal-operator
// warning-as-error that otherwise breaks the Xcode build. `expo prebuild` regenerates the
// Podfile from scratch, so this patch has to be reapplied via a plugin rather than a one-off edit.
const MARKER = 'goodhelp custom arm64 simulator + warning flag patch';

function withIosPodfilePostInstall(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (contents.includes(MARKER)) {
        return config;
      }

      const anchor = 'post_install do |installer|';
      const anchorIndex = contents.indexOf(anchor);
      if (anchorIndex === -1) {
        throw new Error('withIosPodfilePostInstall: could not find "post_install do |installer|" in Podfile');
      }

      const insertAt = anchorIndex + anchor.length;
      const patch = `
    # ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'i386'
        build_config.build_settings['OTHER_CPLUSPLUSFLAGS'] ||= ['$(inherited)']
        build_config.build_settings['OTHER_CPLUSPLUSFLAGS'] << '-Wno-error=deprecated-literal-operator'
        build_config.build_settings['OTHER_CPLUSPLUSFLAGS'] << '-Wno-unknown-warning-option'
      end
    end

    Dir.glob(File.join(installer.sandbox.root, 'Target Support Files', '**', '*.xcconfig')).each do |xcconfig_path|
      xcconfig_contents = File.read(xcconfig_path)
      next unless xcconfig_contents.include?('EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64')

      File.write(xcconfig_path, xcconfig_contents.gsub('EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64', 'EXCLUDED_ARCHS[sdk=iphonesimulator*] = i386'))
    end
`;

      contents = contents.slice(0, insertAt) + patch + contents.slice(insertAt);
      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
}

module.exports = withIosPodfilePostInstall;
