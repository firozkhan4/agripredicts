import type { FarmRecord, FarmData } from '../type';

// Raw CSV Data provided in the prompt
const CSV_DATA = `farm_id,region,crop_type,soil_moisture_%,soil_pH,temperature_C,rainfall_mm,humidity_%,sunlight_hours,irrigation_type,fertilizer_type,pesticide_usage_ml,sowing_date,harvest_date,total_days,yield_kg_per_hectare,sensor_id,timestamp,latitude,longitude,NDVI_index,crop_disease_status
FARM0001,North India,Wheat,35.95,5.99,17.79,75.62,77.03,7.27,None,Organic,6.34,2024-01-08,2024-05-09,122,4408.07,SENS0001,2024-03-19,14.970941,82.997689,0.63,Mild
FARM0002,South USA,Soybean,19.74,7.24,30.18,89.91,61.13,5.67,Sprinkler,Inorganic,9.6,2024-02-04,2024-05-26,112,5389.98,SENS0002,2024-04-21,16.613022,70.869009,0.58,None
FARM0003,South USA,Wheat,29.32,7.16,27.37,265.43,68.87,8.23,Drip,Mixed,15.26,2024-02-03,2024-06-26,144,2931.16,SENS0003,2024-02-28,19.503156,79.068206,0.8,Mild
FARM0004,Central USA,Maize,17.33,6.03,33.73,212.01,70.46,5.03,Sprinkler,Organic,25.8,2024-02-21,2024-07-04,134,4227.8,SENS0004,2024-05-14,31.071298,85.519998,0.44,None
FARM0005,Central USA,Cotton,19.37,5.92,33.86,269.09,55.73,7.93,None,Mixed,25.65,2024-02-05,2024-05-20,105,4979.96,SENS0005,2024-04-13,16.56854,81.69172,0.84,Severe
FARM0006,Central USA,Rice,44.91,5.78,24.87,238.95,83.06,4.92,Sprinkler,Mixed,24.0,2024-01-13,2024-05-06,114,4383.55,SENS0006,2024-03-12,23.227859,89.421568,0.82,None
FARM0007,North India,Soybean,36.28,7.04,21.8,123.38,47.91,4.02,Manual,Mixed,39.29,2024-03-04,2024-07-27,145,4501.2,SENS0007,2024-07-11,25.224255,73.056785,0.76,None
FARM0008,East Africa,Maize,27.1,5.72,22.26,296.33,80.34,5.44,Sprinkler,Mixed,47.61,2024-01-24,2024-05-24,121,5264.09,SENS0008,2024-04-30,23.317654,72.51521,0.7,Mild
FARM0009,Central USA,Soybean,40.54,6.35,19.24,184.82,76.5,5.21,Manual,Inorganic,49.78,2024-03-12,2024-07-08,118,5598.46,SENS0009,2024-05-08,13.025105,74.493947,0.5,Mild
FARM0010,East Africa,Rice,10.25,6.92,16.18,66.85,41.57,5.98,Sprinkler,Inorganic,35.1,2024-01-18,2024-04-25,98,4893.41,SENS0010,2024-03-31,24.405291,74.859945,0.58,Severe
FARM0011,South India,Wheat,13.39,6.36,23.47,166.76,76.45,8.04,Drip,Organic,23.12,2024-02-26,2024-07-20,145,2437.08,SENS0011,2024-04-15,14.755223,78.972271,0.55,Moderate
FARM0012,South USA,Rice,40.61,5.65,31.16,263.99,44.9,7.91,Drip,Organic,46.69,2024-01-06,2024-05-01,116,3942.56,SENS0012,2024-02-02,31.61626,88.048857,0.4,None
FARM0013,South USA,Maize,42.43,7.07,20.7,224.15,76.53,8.7,None,Organic,13.55,2024-01-02,2024-05-08,127,4942.95,SENS0013,2024-01-17,28.699389,71.143305,0.65,Mild
FARM0014,North India,Soybean,12.8,5.87,26.9,218.8,51.76,4.72,Sprinkler,Mixed,31.75,2024-03-03,2024-06-27,116,4629.49,SENS0014,2024-05-14,23.069568,88.694125,0.42,Moderate
FARM0015,South India,Maize,23.85,6.84,21.0,129.04,77.59,4.44,None,Mixed,49.93,2024-01-03,2024-05-06,124,2852.62,SENS0015,2024-02-05,13.311414,76.980177,0.34,Mild
FARM0016,Central USA,Maize,15.52,7.17,29.07,202.92,89.36,7.92,Drip,Mixed,41.77,2024-02-22,2024-05-28,96,5755.72,SENS0016,2024-03-10,16.611648,87.794254,0.75,Mild
FARM0017,Central USA,Maize,31.17,6.94,19.07,208.56,53.2,6.93,Drip,Organic,33.54,2024-02-02,2024-05-02,90,3334.23,SENS0017,2024-02-18,25.927834,75.239105,0.74,Severe
FARM0018,East Africa,Wheat,13.92,7.39,28.82,87.26,41.8,6.22,Sprinkler,Inorganic,10.74,2024-02-12,2024-07-08,147,5732.35,SENS0018,2024-02-22,32.473116,74.201531,0.45,None
FARM0019,Central USA,Soybean,40.94,6.31,27.41,88.64,86.49,9.19,Sprinkler,Inorganic,6.12,2024-03-11,2024-07-29,140,5723.26,SENS0019,2024-05-13,16.670143,85.74749,0.36,None
FARM0020,South USA,Rice,16.99,7.34,21.99,255.13,83.57,5.34,Sprinkler,Inorganic,19.77,2024-01-25,2024-05-11,107,3404.58,SENS0020,2024-03-30,19.99196,89.622994,0.62,None
FARM0021,North India,Maize,16.25,7.43,20.31,77.1,61.73,8.37,Manual,Inorganic,32.28,2024-03-04,2024-06-26,114,5598.02,SENS0021,2024-03-28,16.368063,84.175706,0.3,Mild
FARM0022,Central USA,Cotton,12.45,6.83,21.6,128.48,82.4,8.32,Manual,Mixed,18.92,2024-02-11,2024-06-05,115,4788.83,SENS0022,2024-04-21,13.182195,78.408927,0.86,Mild
FARM0023,East Africa,Soybean,20.53,6.6,15.01,121.73,61.49,7.48,Manual,Inorganic,24.88,2024-03-07,2024-07-07,122,3892.74,SENS0023,2024-06-30,33.9958,84.719229,0.7,Moderate
FARM0024,East Africa,Soybean,21.73,7.14,30.02,218.2,51.23,5.19,Drip,Organic,16.02,2024-02-20,2024-07-13,144,5073.96,SENS0024,2024-06-15,20.361025,82.595308,0.42,Severe
FARM0025,South USA,Cotton,18.54,6.81,15.11,237.74,78.5,4.64,None,Organic,12.91,2024-03-17,2024-07-14,119,2200.87,SENS0025,2024-04-17,32.93675,72.427172,0.38,Severe
FARM0026,East Africa,Soybean,30.84,7.4,32.83,203.16,75.96,7.03,None,Organic,38.46,2024-02-15,2024-05-31,106,5007.11,SENS0026,2024-05-06,16.932784,85.553497,0.59,Mild
FARM0027,Central USA,Cotton,12.71,6.07,20.43,129.93,67.01,4.83,Sprinkler,Inorganic,36.23,2024-03-07,2024-06-09,94,3659.47,SENS0027,2024-04-18,23.565279,78.315485,0.42,Severe
FARM0028,South USA,Soybean,43.11,5.54,32.61,193.92,63.85,9.66,Manual,Inorganic,43.41,2024-02-18,2024-07-04,137,4938.54,SENS0028,2024-04-14,22.205737,75.458706,0.59,Severe
FARM0029,Central USA,Cotton,35.35,7.18,33.39,295.18,66.71,9.44,Drip,Organic,33.92,2024-01-28,2024-05-26,119,2726.92,SENS0029,2024-03-01,19.477597,74.233206,0.5,Severe
FARM0030,Central USA,Cotton,18.83,5.66,15.39,184.85,90.0,6.1,Drip,Mixed,6.81,2024-01-08,2024-04-19,102,5356.92,SENS0030,2024-03-27,13.809559,72.524419,0.7,Mild
FARM0031,South USA,Maize,36.84,5.84,27.14,236.98,45.73,8.92,Manual,Organic,31.04,2024-02-19,2024-07-01,133,5632.1,SENS0031,2024-05-25,19.916361,84.300294,0.35,Mild
FARM0032,North India,Maize,39.76,6.7,17.42,295.96,79.13,6.08,None,Mixed,21.68,2024-03-21,2024-07-10,111,2050.61,SENS0032,2024-05-13,30.558273,72.110777,0.88,Severe
FARM0033,South India,Cotton,16.16,6.54,28.01,203.98,85.98,8.65,None,Inorganic,42.16,2024-03-09,2024-06-27,110,5406.85,SENS0033,2024-06-23,33.365547,75.578565,0.57,Severe
FARM0034,East Africa,Soybean,33.39,6.17,24.89,131.25,64.38,6.13,Manual,Inorganic,17.58,2024-03-23,2024-08-16,146,3105.07,SENS0034,2024-03-25,22.915681,73.821128,0.44,Severe
FARM0035,South USA,Soybean,36.54,6.88,27.92,172.71,79.65,4.56,Sprinkler,Inorganic,36.13,2024-02-22,2024-06-28,127,3476.08,SENS0035,2024-05-20,20.637595,84.918709,0.5,Severe
FARM0036,Central USA,Maize,18.8,5.74,18.85,79.89,66.79,8.57,Sprinkler,Organic,14.74,2024-02-09,2024-06-24,136,4358.35,SENS0036,2024-06-22,24.919769,89.610213,0.8,Moderate
FARM0037,South India,Maize,16.28,5.53,25.68,118.58,88.71,7.32,Sprinkler,Mixed,44.08,2024-02-04,2024-06-28,145,2049.06,SENS0037,2024-04-16,21.734924,78.809376,0.41,None
FARM0038,Central USA,Cotton,13.99,5.63,24.83,194.26,74.32,4.91,Manual,Organic,49.73,2024-01-18,2024-06-04,138,3664.7,SENS0038,2024-03-15,29.392338,77.607561,0.85,Moderate
FARM0039,East Africa,Cotton,20.69,6.74,27.19,235.02,87.38,5.25,Sprinkler,Inorganic,34.72,2024-01-08,2024-04-18,101,4207.97,SENS0039,2024-01-28,10.066893,79.010074,0.66,Moderate
FARM0040,North India,Rice,20.08,6.07,32.19,67.79,51.67,5.59,Sprinkler,Inorganic,10.16,2024-01-21,2024-04-29,99,5633.65,SENS0040,2024-02-08,11.785246,73.318456,0.48,Moderate
FARM0041,South USA,Wheat,26.4,6.11,23.05,118.06,67.0,6.63,Drip,Inorganic,38.05,2024-03-09,2024-06-08,91,2365.31,SENS0041,2024-06-03,30.898965,81.503982,0.87,Moderate
FARM0042,East Africa,Wheat,36.71,5.85,25.38,160.56,53.91,9.98,None,Mixed,41.64,2024-01-16,2024-05-07,112,3633.39,SENS0042,2024-02-26,26.753338,87.154662,0.5,Severe
FARM0043,Central USA,Cotton,38.47,6.6,24.1,128.63,56.16,9.82,None,Mixed,42.12,2024-01-22,2024-06-15,145,4170.37,SENS0043,2024-05-06,11.355102,80.368788,0.67,Severe
FARM0044,South USA,Wheat,17.12,6.6,33.55,159.53,74.91,4.73,Sprinkler,Mixed,12.13,2024-03-01,2024-07-04,125,3631.96,SENS0044,2024-03-29,34.806428,88.258598,0.58,None
FARM0045,South India,Cotton,42.64,6.08,29.11,153.87,64.12,6.83,None,Mixed,11.51,2024-01-20,2024-05-21,122,4985.17,SENS0045,2024-02-06,31.600673,75.524948,0.77,Severe
FARM0046,Central USA,Soybean,19.35,5.51,29.52,259.37,69.0,7.96,Sprinkler,Inorganic,29.24,2024-02-11,2024-06-15,125,5051.49,SENS0046,2024-03-30,21.383615,76.435547,0.41,Mild
FARM0047,East Africa,Cotton,18.17,7.05,15.87,236.18,75.26,8.87,None,Mixed,40.66,2024-03-05,2024-07-04,121,5859.3,SENS0047,2024-03-21,22.557279,81.803609,0.82,Severe
FARM0048,North India,Soybean,41.87,5.53,17.88,267.73,88.5,4.45,Manual,Inorganic,33.05,2024-02-21,2024-05-26,95,5407.06,SENS0048,2024-05-17,31.483555,77.600188,0.49,Severe
FARM0049,East Africa,Wheat,31.61,5.97,28.69,121.84,51.37,4.54,Drip,Mixed,36.68,2024-01-15,2024-04-24,100,4776.0,SENS0049,2024-01-18,11.149774,85.922869,0.48,Moderate
FARM0050,South USA,Rice,18.55,6.32,28.64,95.01,48.75,7.66,None,Mixed,35.74,2024-02-19,2024-05-28,99,2928.75,SENS0050,2024-05-10,16.349433,75.106534,0.31,Severe
FARM0051,Central USA,Soybean,15.53,6.38,21.91,196.89,71.95,6.55,Manual,Inorganic,43.04,2024-01-13,2024-06-05,144,3932.83,SENS0051,2024-03-13,19.534107,77.179183,0.48,Moderate
FARM0052,North India,Cotton,19.61,6.63,28.72,236.17,42.45,7.64,None,Inorganic,39.91,2024-01-20,2024-06-09,141,3409.28,SENS0052,2024-03-08,25.522279,83.555289,0.73,Mild
FARM0053,North India,Wheat,20.81,6.38,26.59,233.09,44.51,5.77,None,Organic,14.04,2024-03-12,2024-07-13,123,4007.18,SENS0053,2024-04-15,30.761815,75.139402,0.79,Severe
FARM0054,Central USA,Maize,38.15,6.44,16.51,238.54,51.28,8.06,None,Mixed,21.46,2024-02-01,2024-05-17,106,4146.29,SENS0054,2024-03-30,19.214641,84.980232,0.46,Severe
FARM0055,Central USA,Wheat,33.62,6.44,27.39,285.79,56.4,7.66,Drip,Mixed,42.07,2024-03-10,2024-07-19,131,3633.18,SENS0055,2024-04-14,11.13367,70.744243,0.9,None
FARM0056,North India,Rice,41.05,5.77,24.07,217.62,77.16,9.68,None,Mixed,38.4,2024-01-14,2024-05-24,131,2396.09,SENS0056,2024-05-18,25.391305,88.781061,0.47,Moderate
FARM0057,South India,Cotton,25.56,5.97,22.25,295.23,58.37,9.41,Manual,Organic,22.92,2024-01-04,2024-06-02,150,5392.13,SENS0057,2024-04-29,12.291836,74.242116,0.68,None
FARM0058,North India,Maize,18.52,5.75,26.29,67.15,78.26,5.24,Sprinkler,Organic,19.79,2024-01-26,2024-06-21,147,4383.93,SENS0058,2024-04-05,31.460153,72.89376,0.38,Moderate
FARM0059,South India,Wheat,33.14,5.55,15.3,247.5,51.9,5.94,Sprinkler,Inorganic,7.36,2024-03-14,2024-07-15,123,2454.6,SENS0059,2024-03-22,21.906149,85.560341,0.61,None
FARM0060,South USA,Soybean,17.75,6.73,29.54,277.19,72.95,5.81,Drip,Organic,49.94,2024-02-14,2024-06-26,133,2431.85,SENS0060,2024-06-06,11.837268,71.61581,0.66,None`;

// Convert FarmRecord to FarmData
const convertToFarmData = (record: FarmRecord, index: number): FarmData => {
  return {
    id: index + 1,
    cropType: record.crop_type,
    ph: record.soil_pH,
    nitrogen: record.soil_moisture * 0.1, // Example calculation from moisture
    phosphorus: record.sunlight_hours * 0.05, // Example calculation from sunlight
    potassium: record.yield_kg * 0.001, // Example calculation from yield
    temperature: record.temperature,
    humidity: record.humidity,
    rainfall: record.rainfall
  };
};

// Get data as FarmRecord[] (for components that need the raw CSV structure)
export const getFarmRecords = (): FarmRecord[] => {
  const lines = CSV_DATA.trim().split('\n');
  const headers = lines[0].split(',');
  console.log(headers)

  // Skip header
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      farm_id: values[0],
      region: values[1],
      crop_type: values[2],
      soil_moisture: parseFloat(values[3]),
      soil_pH: parseFloat(values[4]),
      temperature: parseFloat(values[5]),
      rainfall: parseFloat(values[6]),
      humidity: parseFloat(values[7]),
      sunlight_hours: parseFloat(values[8]),
      yield_kg: parseFloat(values[15]),
      disease_status: values[21]
    };
  });
};

// Get data as FarmData[] (for your existing components)
export const getFarmData = (): FarmData[] => {
  const farmRecords = getFarmRecords();
  return farmRecords.map((record, index) => convertToFarmData(record, index));
};

export const getAllCrops = (data: FarmRecord[]): string[] => {
  return Array.from(new Set(data.map(d => d.crop_type))).sort();
};

// Parse uploaded CSV and convert to FarmData
export const parseCSVData = (file: File): Promise<FarmData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n').filter(line => line.trim() !== '');

        if (lines.length < 2) {
          reject(new Error('CSV file is empty or has no data rows'));
          return;
        }

        const headers = lines[0].split(',').map(header => header.trim());
        const parsedData: FarmData[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(value => value.trim());

          if (values.length !== headers.length) {
            console.warn(`Skipping row ${i + 1}: column count mismatch`);
            continue;
          }

          const row: any = {};
          headers.forEach((header, index) => {
            const value = values[index];
            const numValue = Number(value);
            row[header] = isNaN(numValue) ? value : numValue;
          });

          // Create FarmRecord from CSV row
          const farmRecord: FarmRecord = {
            farm_id: row.farm_id || `uploaded_${i}`,
            region: row.region || 'unknown',
            crop_type: row.crop_type || row.crop_type || 'unknown',
            soil_moisture: Number(row.soil_moisture || row.soil_moisture_ || 0),
            soil_pH: Number(row.soil_pH || row.soil_ph || 7.0),
            temperature: Number(row.temperature || row.temperature_C || 0),
            rainfall: Number(row.rainfall || row.rainfall_mm || 0),
            humidity: Number(row.humidity || row.humidity_ || 0),
            sunlight_hours: Number(row.sunlight_hours || 0),
            yield_kg: Number(row.yield_kg || row.yield_kg_per_hectare || 0),
            disease_status: row.disease_status || row.crop_disease_status || 'unknown'
          };

          // Convert to FarmData for your components
          const farmData = convertToFarmData(farmRecord, i);
          parsedData.push(farmData);
        }

        if (parsedData.length === 0) {
          reject(new Error('No valid data found in CSV file'));
          return;
        }

        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
