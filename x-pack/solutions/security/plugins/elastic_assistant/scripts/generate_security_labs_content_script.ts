/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable no-console */

import { SecurityLabsContent } from '@kbn/security-labs-content';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import globby from 'globby';
import yaml from 'js-yaml';

export const INPUT_DIR = path.join(__dirname, '../server/knowledge_base/security_labs')
export const OUTPUT_DIR = '../../../../../target/security_labs_content';
export const DELETE_FILES_PATTERN = '*.json';
export const SAVED_OBJECT_ID_PREFIX = 'security_labs_content-';


interface SecurityLabsContentSavedObject {
  attributes: SecurityLabsContent;
  id: string;
  type: 'security_labs_content';
}

export const createOutputDir = () => {
  if (!existsSync(OUTPUT_DIR)) {
    console.log(`Creating output directory: ${OUTPUT_DIR}`);
    mkdirSync(OUTPUT_DIR);
  }
};

export const deleteFilesByPattern = async ({
  directoryPath,
  pattern,
}: {
  directoryPath: string;
  pattern: string;
}): Promise<void> => {
  try {
    console.log(`Deleting files matching pattern "${pattern}" in directory "${directoryPath}"`);
    const files = await globby(pattern, { cwd: directoryPath });

    if (files.length === 0) {
      console.log(`No files found matching pattern "${pattern}" in directory "${directoryPath}".`);
      return;
    }

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      await fs.unlink(filePath);
      console.log(`Deleted file: "${filePath}"`);
    }
  } catch (error) {
    console.error(`Error deleting files: ${error.message}`);
    throw error;
  }
};

export const writeSavedObjects = async ({
  direcotryPath,
  savedObjects,
}: {
  direcotryPath: string;
  savedObjects: SecurityLabsContentSavedObject[];
}) => {
  for (const savedObject of savedObjects) {
    const filePath = path.join(direcotryPath, `${savedObject.id}.json`);

    await fs.writeFile(filePath, `${JSON.stringify(savedObject, null, 2)}\n`);
    console.log(`Wrote saved object to file: "${filePath}"`);
  }
};

export const generateSavedObject = (fileName: string, fileContent: string): SecurityLabsContentSavedObject => {

  const split = fileContent.split('---');
  const yamlString = split[1];

  const parsed = yaml.load(yamlString) as {
    title: string;
    slug: string;
    subtitle: string;
    date: string;
    description: string;
    author: {
      slug: string;
    }[];
    image: string;
    category: {
      slug: string;
    }[]
    tags: string[];
  };

  return {
    attributes: {
      raw: {
        document: fileContent,
      },
      title: parsed.title,
      slug: parsed.slug,
      subtitle: parsed.subtitle,
      date: parsed.date,
      description: parsed.description,
      author: parsed.author,
      image: parsed.image,
      category: parsed.category,
      tags: parsed.tags,
    },
    id: `${SAVED_OBJECT_ID_PREFIX}${fileName.replace(".", "-")}`,
    type: 'security_labs_content',
  }
};

export const generateSavedObjects = (fileNames: string[]): Promise<SecurityLabsContentSavedObject[]> => {
  const savedObjects = fileNames.map(async (fileName) => {
    const content = await fs.readFile(path.join(INPUT_DIR, fileName), 'utf-8');
    return generateSavedObject(fileName, content);
  })
  return Promise.all(savedObjects);
}

export const generateSecurityLabsContent = async () => {
  console.log('Generating Security labs content');

  createOutputDir();

  await deleteFilesByPattern({
    directoryPath: OUTPUT_DIR,
    pattern: DELETE_FILES_PATTERN,
  });

  const fileNames = await globby('*.md', { cwd: INPUT_DIR });

  console.log('--> fileNames', fileNames.length, "e.g.", fileNames.at(0));

  const savedObjects = await generateSavedObjects(fileNames);

  console.log('--> savedObjects', savedObjects.length, "e.g.", savedObjects.at(0));

  await writeSavedObjects({
    direcotryPath: OUTPUT_DIR,
    savedObjects,
  });

  console.log('Done');
};
