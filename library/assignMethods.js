// custom methods
import * as customMethods from "./customMethods.js"

// strategies

import { availableBankPacks } from "../strategies/availableBankPacks.js"
import { findOrGetTarget } from "../strategies/findOrGetTarget.js"
import { moveInsideMonsterBoundary } from "../strategies/moveInsideMonsterBoundary.js"
import { depositItemsToBank } from "../strategies/depositItemsToBank.js"
import { moveTowardsTargetIfNotInRange } from "../strategies/moveTowardsTargetIfNotInRange.js"
import { useHPOrMP } from "../strategies/useHPOrMP.js"

// misc 
import * as nonCombatMethods from "../misc/nonCombatMethods.js"

// startup
import gameMessages from "../startupMethods/gameMessages.js"
import formParty from "../startupMethods/formParty.js"
import { combatantOnCM, merchantOnCM } from "../startupMethods/onCM.js"
import onReceivingEquipment from "../startupMethods/onReceivingEquipment.js"
import { disperseOnCombinedDamage } from "../startupMethods/disperseOnCombinedDamage.js"
import { handleMagiportInvite } from "../startupMethods/handleMagiportInvite.js"
import startup from "../startup.js"
import startupMerchant from "../startupMerchant.js"

// merchant
import merchantLoop from "../merchantMethods/merchant.js"
import merchantRoutine from "../merchantMethods/merchantRoutine.js"
import autoUpgrade from "../merchantMethods/autoUpgrade.js"
import handleLoot from "../merchantMethods/handleLoot.js"
import bankItems from "../merchantMethods/bankItems.js"

// database
import updateDatabase from "../database/updateDatabase.js"

export default function assignMethods(character) {

	// customMethods
	character.hasEnoughHPOrMP = customMethods.hasEnoughHPOrMP;
	character.getPlayerByName = customMethods.getPlayerByName;
	character.loot = customMethods.loot;
	character.getEntityByID = customMethods.getEntityByID;
	character.countEmptySlots = customMethods.countEmptySlots;

	// strategies
	character.availableBankPacks = availableBankPacks;
	character.findOrGetTarget = findOrGetTarget;
	character.moveInsideMonsterBoundary = moveInsideMonsterBoundary;
	character.depositItemsToBank = depositItemsToBank;
	character.moveTowardsTargetIfNotInRange = moveTowardsTargetIfNotInRange;
	character.useHPOrMP = useHPOrMP;

	// nonCombatMethods
	character.sendLootToMerchant = nonCombatMethods.sendLootToMerchant;
	character.requestConsumables = nonCombatMethods.requestConsumables;

	// startupMethods
	character.gameMessages = gameMessages;
	character.formParty = formParty;
	character.combatantOnCM = combatantOnCM;
	character.onReceivingEquipment = onReceivingEquipment;
	character.disperseOnCombinedDamage = disperseOnCombinedDamage;
	character.handleMagiportInvite = handleMagiportInvite;

	// database
	character.updateDatabase = updateDatabase;

	// startup
	if(character.ctype !== 'merchant') {
		character.startup = startup;
	} else {
		character.startupMerchant = startupMerchant;
	}

	// merchant
	if(character.ctype !== 'merchant') return;
	character.merchantOnCM = merchantOnCM;
	character.merchantLoop = merchantLoop;
	character.merchantRoutine = merchantRoutine;
	character.autoUpgrade = autoUpgrade;
	character.handleLoot = handleLoot;
	character.bankItems = bankItems;

}
