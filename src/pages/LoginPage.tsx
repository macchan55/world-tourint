import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) setError(error.message);
      else setInfo('確認メールを送信しました。メール内のリンクからログインを完了してください。');
    }
    setSubmitting(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>World Tourint</h1>
        <p className="auth-subtitle">訪問国スコアリングアプリ</p>

        <div className="auth-tabs">
          <button
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => setMode('signin')}
            type="button"
          >
            ログイン
          </button>
          <button
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
            type="button"
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>
              表示名
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="旅する太郎"
              />
            </label>
          )}
          <label>
            メールアドレス
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            パスワード
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}

          <button type="submit" disabled={submitting} className="auth-submit">
            {mode === 'signin' ? 'ログイン' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  );
}
