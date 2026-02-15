import { ZoneDef, ZoneId } from '../../engine/types';
import { homeBase } from './homeBase';
import { crystalCaverns } from './crystalCaverns';
import { bioSwamp } from './bioSwamp';

export const ZONES: Record<string, ZoneDef> = {
  homeBase,
  crystalCaverns,
  bioSwamp,
};

export function getZone(id: ZoneId): ZoneDef {
  return ZONES[id] || homeBase;
}

export function getSpawnPoint(zone: ZoneDef, spawnId: string): { x: number; y: number } {
  const spawn = zone.spawns.find(s => s.id === spawnId);
  if (spawn) return { x: spawn.x, y: spawn.y };
  // Fallback to default spawn
  const defaultSpawn = zone.spawns.find(s => s.id === 'default');
  if (defaultSpawn) return { x: defaultSpawn.x, y: defaultSpawn.y };
  return { x: zone.width / 2, y: zone.height / 2 };
}
