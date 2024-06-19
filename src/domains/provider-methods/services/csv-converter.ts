export class CsvConverter {
  public static convert<T extends object>(records: T[], fieldsOrderedMapping: Record<keyof T, string>): string {
    if (!records.length) {
      return '';
    }

    const rows = [Object.values(fieldsOrderedMapping)] as string[][];

    for (const record of records) {
      const row: string[] = [];

      for (const field of Object.keys(fieldsOrderedMapping)) {
        const value = record[field as keyof T] as string;

        row.push(value ? value.toString().replace(/[,\r\n]/g, '') : value);
      }

      rows.push(row);
    }

    return rows.map(row => row.join(',')).join('\n');
  }
}
