/**
 * Simple client-side CSV parser.
 * Handles standard CSV format.
 */
export const parseCSV = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        resolve([]);
        return;
      }

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) {
        resolve([]);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      console.log('CSV Headers:', headers);
      const results = [];

      // A map to normalize different header variations to the desired camelCase key
      const headerMap: { [key: string]: string } = {
          'enrollno': 'enrollNo',
          'subjectcode': 'subjectCode',
          'subjectname': 'subjectName',
          'examdate': 'examDate',
          'starttime': 'startTime',
          'endtime': 'endTime',
          'branch': 'branch',
          'semester': 'semester',
          'name': 'name',
          'batch': 'batch'
      };

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        
        if (row.length !== headers.length) {
          console.warn(`Skipping row ${i + 1}: number of columns does not match headers.`);
          continue;
        }

        const obj: any = {};
        headers.forEach((header, index) => {
          // Normalize header: lowercase and remove all non-alphanumeric characters
          const normalizedHeader = header.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
          
          // Find the correct key from the map, or use the original header (camelCased) as a fallback
          const key = headerMap[normalizedHeader] || header.replace(/\s+(\w)/g, (_, c) => c.toUpperCase());

          obj[key] = row[index];
        });

        results.push(obj);
      }
      console.log('Parsed CSV data:', results);
      resolve(results);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};