import fs from 'fs';

let c = fs.readFileSync('src/components/admin/CmsSettings.tsx', 'utf8');

// 1. Add imports
c = c.replace(
  /import \{ saveMediaBlob, resolveMediaUrl \} from '\.\.\/\.\.\/utils\/mediaStorage';/,
  `import { saveMediaBlob, resolveMediaUrl } from '../../utils/mediaStorage';
import { ShowcaseCmsEditor } from './ShowcaseCmsEditor';
import { mergeHomeSections, SHOWCASE_SECTION_LABELS } from '../showcase/showcaseConfig';`
);

// 2. Use mergeHomeSections
c = c.replace(
  /const currentSections = settings\.homeSections && settings\.homeSections\.length > 0 \? settings\.homeSections : defaultSections;/,
  `const currentSections = mergeHomeSections(settings.homeSections);`
);

// 3. Label tag
c = c.replace(
  /\{section\.id === 'alfombras' \? 'sección nosotros' : section\.id\}/,
  `{SHOWCASE_SECTION_LABELS[section.id]?.title || (section.id === 'alfombras' ? 'sección nosotros' : section.id)}`
);

// 4. Showcase editor right after sections block
c = c.replace(
  /(<\/div>\s*\{\/\* PERSONALIZACI[^\*]+N DE SECCI[^\*]+N NOSOTROS \*\/})/g,
  `</div>

        {/* PERSONALIZACIÓN DE SECCIONES ESTILO CATÁLOGO WIX */}
        <ShowcaseCmsEditor
          showcase={settings.showcase}
          onChange={(updated) => setSettings((prev) => ({ ...prev, showcase: updated }))}
          products={products}
        />

        {/* PERSONALIZACIÓN DE SECCIÓN NOSOTROS */}`
);

fs.writeFileSync('src/components/admin/CmsSettings.tsx', c, 'utf8');
console.log('CmsSettings updated successfully');
