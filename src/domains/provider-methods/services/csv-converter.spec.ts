import { CsvConverter } from './csv-converter';

describe('CsvConverter', () => {
  test('Should return empty string if records array is empty', () => {
    const csv = CsvConverter.convert([], {});

    expect(csv).toBe('');
  });

  test('Should convert records array to CSV format', () => {
    const csv = CsvConverter.convert([
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ], { id: 'ID', name: 'Name', age: 'Age' });

    expect(csv).toBe('ID,Name,Age\n1,John,30\n2,Jane,25');
  });

  test('Should handle missing fields in records', () => {
    const csv = CsvConverter.convert([
      { id: 1, name: 'John' },
      { id: 2, age: 25 },
    ], { id: 'ID', name: 'Name', age: 'Age' });

    expect(csv).toBe('ID,Name,Age\n1,John,\n2,,25');
  });
});
