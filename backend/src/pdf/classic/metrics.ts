import { rgb } from "pdf-lib";

export const PAGE = {
  width: 595.28,
  height: 841.89,
  nameTop: 52,
  photoTop: 60.5,
  bottom: 38,
  left: 42.52,
  right: 42.52,
  mainX: 127.56,
  mainWidth: 426.5,
  photoSize: 70.87,
};

export const COLORS = {
  black: rgb(0, 0, 0),
  muted: rgb(0.48, 0.48, 0.48),
  light: rgb(0.68, 0.68, 0.68),
  line: rgb(0.84, 0.84, 0.84),
  tagBg: rgb(0.9, 0.9, 0.9),
};

export const FONT = {
  name: 24,
  section: 10,
  target: 11,
  company: 11,
  position: 11,
  body: 8,
  meta: 8,
  date: 7,
  sideLabel: 7,
  tag: 8,
  footer: 7,
};

export const LINE = {
  name: 33,
  section: 15,
  target: 16,
  body: 13,
  meta: 13,
  date: 11,
  tag: 15,
};