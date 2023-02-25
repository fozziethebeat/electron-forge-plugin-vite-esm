import path from 'node:path';

import { expect } from 'chai';
import { UserConfig } from 'vite';

import { VitePluginConfig } from '../src/Config';
import ViteConfigGenerator from '../src/ViteConfig';

describe('ViteConfigGenerator', () => {
  it('getDefines', async () => {
    const config = {
      renderer: [{ name: 'foo_window' }, { name: 'bar_window' }],
    } as VitePluginConfig;
    const generator = new ViteConfigGenerator(config, '', false);
    const define = await generator.getDefines();
    expect(define.FOO_WINDOW_VITE_DEV_SERVER_URL).equal('"http://localhost:5173"');
    expect(define.FOO_WINDOW_VITE_NAME).equal('"foo_window"');
    expect(define.BAR_WINDOW_VITE_DEV_SERVER_URL).equal('"http://localhost:5174"');
    expect(define.BAR_WINDOW_VITE_NAME).equal('"bar_window"');
  });

  it('getBuildConfig', async () => {
    const config = {
      build: [{ entry: 'foo.js' }],
      renderer: [],
    } as VitePluginConfig;
    const generator = new ViteConfigGenerator(config, '', true);
    const buildConfig = (await generator.getBuildConfig())[0];
    expect(buildConfig).deep.equal({
      mode: 'production',
      build: {
        lib: {
          entry: 'foo.js',
          formats: ['cjs'],
          // shims
          fileName: (buildConfig.build?.lib as any)?.fileName,
        },
        emptyOutDir: false,
        outDir: path.join('.vite', 'build'),
        watch: undefined,
      },
      clearScreen: false,
      define: {},
      // shims
      plugins: [buildConfig.plugins?.[0]],
    } as UserConfig);
  });

  it('getRendererConfig', async () => {
    const config = {
      renderer: [{ name: 'foo_window' }, { name: 'bar_window' }],
    } as VitePluginConfig;
    const generator = new ViteConfigGenerator(config, '', false);
    let port = 5173;
    const configs = await generator.getRendererConfig();
    for (const [index, rendererConfig] of configs.entries()) {
      expect(rendererConfig).deep.equal({
        mode: 'development',
        base: './',
        build: {
          outDir: path.join('.vite', 'renderer', config.renderer[index].name),
        },
        clearScreen: false,
        server: {
          port: port++,
        },
      } as UserConfig);
    }
  });
});
