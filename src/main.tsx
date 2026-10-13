import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Pretendard Variable (SIL OFL) — npm 패키지에서 번들. 동적 서브셋이라 쓰이는 글자 범위의 woff2만 내려받는다.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles/globals.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
