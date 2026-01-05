import GameManager, { PowerUpType } from '@/logic/GameManager';
import WordleEngine from '@/logic/WordleEngine';
import EconomySystem from '@/logic/EconomySystem';
import MockGamblingApi from '@/services/MockGamblingApi';
import { getRandomWord } from '@/data/dictionary';
import { LuckyShotPowerUp } from '@/logic/powerups/LuckyShotPowerUp';
import { ScannerPowerUp } from '@/logic/powerups/ScannerPowerUp';
import { ExtraLifePowerUp } from '@/logic/powerups/ExtraLifePowerUp';
import { InterfacePowerUp } from '@/logic/powerups/InterfacePowerUp';

const GAME_KEY = "WEB_GAME_KEY";

const economy = new EconomySystem();
const engine = new WordleEngine();
const api = new MockGamblingApi(GAME_KEY);

const powerUps = new Map<PowerUpType, InterfacePowerUp>();
powerUps.set("scanner", new ScannerPowerUp());
powerUps.set("lucky_shot", new LuckyShotPowerUp());
powerUps.set("extra_life", new ExtraLifePowerUp());

export const gameManager = new GameManager(
    economy,
    engine,
    getRandomWord,
    powerUps,
    api
);
