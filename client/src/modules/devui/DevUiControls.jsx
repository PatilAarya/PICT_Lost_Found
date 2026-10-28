// The interactive half of the dev gallery: colour tokens, type scale, buttons,
// form fields, category tiles and the colour picker. Split out of DevUiPage.jsx to
// keep each file short. Dev-only, never shown in production builds.
import { useState } from 'react';
import { CATEGORIES } from '../../shared/constants.js';
import { Button, ChipSelect, ColorPicker, Field, TextInput } from '../../shared/ui/index.js';

const TOKENS = ['paper', 'ink', 'frost', 'steel', 'berry', 'berry-ink'];
const TYPE_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

// "id_card" becomes "id card" for chip labels.
const categoryOptions = CATEGORIES.map((category) => ({
  value: category,
  label: category.replace('_', ' '),
  category,
}));

export function DevUiControls() {
  const [category, setCategory] = useState('bottle');
  const [colors, setColors] = useState(['blue']);
  const [title, setTitle] = useState('');

  return (
    <>
      <section className="devui-section">
        <h2>Colours and type</h2>
        <div className="devui-row">
          {TOKENS.map((token) => (
            <figure key={token} className="devui-figure">
              <span className="devui-token" style={{ background: `var(--${token})` }} />
              <figcaption>--{token}</figcaption>
            </figure>
          ))}
        </div>
        {TYPE_SIZES.map((size) => (
          <p key={size} style={{ fontSize: `var(--text-${size})`, margin: 0 }}>
            Text {size}: Black phone found near Lab 2
          </p>
        ))}
        <p className="devui-serial tabular">PICT-F-000123</p>
      </section>

      <section className="devui-section">
        <h2>Buttons</h2>
        <div className="devui-row">
          <Button icon="arrow-right">Send claim</Button>
          <Button variant="secondary" icon="camera">
            Add photo
          </Button>
          <Button variant="quiet" icon="arrow-left">
            Back
          </Button>
          <Button variant="danger" icon="trash">
            Delete report
          </Button>
          <Button size="lg" loading>
            Post found item
          </Button>
        </div>
      </section>

      <section className="devui-section">
        <h2>Fields and chips</h2>
        <Field label="Title" hint="For example: Blue steel water bottle">
          <TextInput value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Brand" error="Brand is too long. Use 40 characters or fewer.">
          <TextInput defaultValue="Milton Thermosteel Flip Lid Bottle 1000 ml Blue edition" />
        </Field>
        <ChipSelect options={categoryOptions} value={category} onChange={setCategory} />
        <ColorPicker value={colors} onChange={setColors} />
      </section>
    </>
  );
}
