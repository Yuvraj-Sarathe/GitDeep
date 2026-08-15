import { memo } from 'react';

import './StarField.css';

const StarField = memo(() => (
  <div className="starfield" aria-hidden="true">
    <div className="stars" />
    <div className="stars2" />
    <div className="stars3" />
  </div>
));

StarField.displayName = 'StarField';

export default StarField;