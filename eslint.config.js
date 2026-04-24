import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*']
  },
  {
    files: ['*.rules'],
    plugins: {
      '@firebase/security-rules': firebaseRulesPlugin
    },
    rules: {
       // Manual rule entries if flat/recommended fails to spread properly in this env
       '@firebase/security-rules/no-unspecified-operations': 'error'
    }
  }
];
