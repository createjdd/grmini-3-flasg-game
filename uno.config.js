import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['flex-center', 'flex items-center justify-center'],
    ['flex-col-center', 'flex flex-col items-center justify-center'],
    ['glass-bg', 'bg-white/5 backdrop-blur-10 border border-white/10'],
    ['glass-panel', 'bg-slate-900/80 backdrop-blur-20 border border-white/10 rounded-3xl p-10'],
    ['btn-base', 'px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer active:scale-95'],
    ['title-gradient', 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'Fira Code',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
