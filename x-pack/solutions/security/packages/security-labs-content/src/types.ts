/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export interface Author {
  slug: string;
}

export interface Category {
  slug: string;
}

export interface Raw {
  document: string;
}

export interface SecurityLabsContent {
  raw: Raw;
  title: string;
  slug: string;
  subtitle: string;
  date: string;
  description: string;
  author: Author[];
  image: string;
  category: Category[]
  tags: string[]
}