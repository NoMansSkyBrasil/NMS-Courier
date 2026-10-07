"""Read and write the Markdown data tables kept in this folder.

Research data that used to live in tab-separated or plain-text files is stored
as one Markdown table per file, so people and language models read it directly
and tools still parse it. A data file carries the marker line below, a title,
and exactly one table; cells escape a vertical bar as a backslash and a bar.
"""
from pathlib import Path

MARKER = '<!-- data-table: parsed by runtime/research/markdown_data.py; keep one table, one row per entry -->'


def escape(cell):
    return cell.replace('\\', '\\\\').replace('|', '\\|')


def split_row(line):
    """Cells of one table row, honouring backslash escapes."""
    cells, current, index = [], [], 0
    text = line.strip()
    if not text.startswith('|') or not text.endswith('|'):
        raise ValueError('Not a table row: ' + line[:60])
    text = text[1:-1]
    while index < len(text):
        character = text[index]
        if character == '\\' and index + 1 < len(text):
            current.append(text[index + 1])
            index += 2
            continue
        if character == '|':
            cells.append(''.join(current).strip())
            current = []
        else:
            current.append(character)
        index += 1
    cells.append(''.join(current).strip())
    return cells


def read_table(path):
    """(header cells, list of row cell lists) of the first table in a Markdown data file."""
    lines = Path(path).read_text(encoding='utf-8').splitlines()
    start = next((index for index, line in enumerate(lines) if line.lstrip().startswith('|')), None)
    if start is None or start + 1 >= len(lines) or not set(lines[start + 1].replace('|', '').strip()) <= set('-: '):
        raise ValueError('No Markdown table in ' + str(path))
    header = split_row(lines[start])
    rows = []
    for line in lines[start + 2:]:
        if not line.lstrip().startswith('|'):
            break
        cells = split_row(line)
        if len(cells) != len(header):
            raise ValueError('Row width differs from the header in ' + str(path))
        rows.append(cells)
    return header, rows


def rows_as_tab_separated(path, with_header=False):
    """Table rows joined by tabs, the form the offline analysis scripts consume."""
    header, rows = read_table(path)
    lines = (['\t'.join(header)] if with_header else []) + ['\t'.join(row) for row in rows]
    return '\n'.join(lines) + '\n'


def write_table(path, title, description, header, rows):
    lines = ['# ' + title, '', MARKER, '', description, '',
             '| ' + ' | '.join(escape(cell) for cell in header) + ' |',
             '| ' + ' | '.join('---' for _ in header) + ' |']
    lines += ['| ' + ' | '.join(escape(cell) for cell in row) + ' |' for row in rows]
    Path(path).write_text('\n'.join(lines) + '\n', encoding='utf-8', newline='\n')


if __name__ == '__main__':
    # Print one column of a data table, one value per line, for use in shell pipelines:
    #   python runtime/research/markdown_data.py <file.md> [column number, default 1]
    import sys
    _, table_rows = read_table(sys.argv[1])
    column = int(sys.argv[2]) - 1 if len(sys.argv) > 2 else 0
    sys.stdout.reconfigure(encoding='utf-8')
    for table_row in table_rows:
        print(table_row[column])
