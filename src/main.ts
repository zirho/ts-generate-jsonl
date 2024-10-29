import csv from 'csvtojson';
import fs from 'fs';

export function splitSamples({
  samples,
  percent,
}: {
  samples: unknown[];
  percent: number;
}) {
  const batch1 = samples.slice(0, Math.floor(samples.length * percent));
  const batch2 = samples.slice(Math.floor(samples.length * percent));
  return [batch1, batch2];
}

export async function main() {
  const json = await csv().fromFile('./input.csv');

  const trainingDataset = json.map((row) => {
    return {
      messages: [
        {
          role: 'system',
          content:
            'You should classify the text into one of the following regions:[US,UK,Mexico,LatAm,Europe,Canada,Australia,Asia,Africa]',
        },
        {
          role: 'user',
          content: row.location,
        },
        {
          role: 'model',
          content: row.region,
        },
      ],
    };
  });

  const datasets = trainingDataset.map((row) => {
    // don't use JSON.stringify(row, null, 2) because it will add new lines
    // it is invalid for jsonl format
    return JSON.stringify(row);
  });

  const [trainingData, validationData] = splitSamples({
    samples: datasets,
    percent: 0.8,
  });

  const trainingList = trainingData.join('\n');
  const validationList = validationData.join('\n');

  if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
  }

  const date = new Date().getTime();
  if (!fs.existsSync(`./output/${date}`)) {
    fs.mkdirSync(`./output/${date}`);
  }

  fs.writeFileSync(`./output/${date}/training.jsonl`, trainingList);
  fs.writeFileSync(`./output/${date}/validation.jsonl`, validationList);
}

main();

/**
 * {
    "messages": [
      {
        "role": "system",
        "content": "You should classify the text into one of the following regions:[US,UK,Mexico,LatAm,Europe,Canada,Australia,Asia,Africa]"
      },
      { "role": "user", "content": "Albany, New York Metropolitan Area" },
      { "role": "model", "content": "US" }
    ]
  }
 */
