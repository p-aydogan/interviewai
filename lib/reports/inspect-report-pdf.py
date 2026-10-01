"""Diagnostic-only pypdf inspector. No production parser dependency."""
import io, json, re, sys
from pypdf import PdfReader
from pypdf.generic import ContentStream, ByteStringObject, TextStringObject
reader = PdfReader(io.BytesIO(sys.stdin.buffer.read()))
errors = []
for page in reader.pages:
    mappings = {}
    for key, ref in page['/Resources']['/Font'].items():
        font = ref.get_object()
        if '/ToUnicode' not in font:
            errors.append('Missing ToUnicode: ' + key)
            continue
        cmap = font['/ToUnicode'].get_data().decode('latin1')
        entries = {}
        for block in re.findall(r'beginbfchar(.*?)endbfchar', cmap, re.S):
            for source, target in re.findall(r'<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]*)>', block):
                entries[int(source, 16)] = target
        if any(not target for target in entries.values()):
            errors.append('Empty Unicode destination: ' + key)
        mappings[key] = entries
    active = None
    for args, op in ContentStream(page.get_contents(), reader).operations:
        if op == b'Tf':
            active = args[0]
        if op not in (b'Tj', b'TJ'):
            continue
        for value in (args[0] if op == b'TJ' else [args[0]]):
            if isinstance(value, ByteStringObject):
                raw = bytes(value)
            elif isinstance(value, TextStringObject):
                raw = value.original_bytes
            else:
                continue
            if len(raw) % 2:
                errors.append('Invalid CID byte length')
            for offset in range(0, len(raw), 2):
                cid = int.from_bytes(raw[offset:offset+2], 'big')
                if not mappings.get(active, {}).get(cid):
                    errors.append('Unmapped used CID: ' + str(cid))
print(json.dumps({'pages': [page.extract_text() for page in reader.pages], 'mappingErrors': sorted(set(errors))}))
