# 🚀 Cómo desplegar el Faucet en Sepolia

## Paso 1: Abrir Remix
1. Ve a https://remix.ethereum.org
2. Crea un nuevo archivo: `PublicFaucetNew.sol`

## Paso 2: Copiar el contrato
Copia el código del archivo: `src/lib/contracts/PublicFaucetNew.sol`

## Paso 3: Compilar
1. Ve al panel "Solidity Compiler"
2. Selecciona versión: `0.8.20` o superior
3. Click en "Compile PublicFaucetNew.sol"

## Paso 4: Conectar a Sepolia
1. Instala MetaMask o Pali Wallet
2. Cambia la red a **Sepolia Testnet**
3. Asegúrate de tener al menos 0.1 ETH de Sepolia
   - Si no tienes, obtén de: https://sepoliafaucet.com/

## Paso 5: Desplegar
1. Ve al panel "Deploy & Run Transactions"
2. En "Environment" selecciona: **Injected Provider - MetaMask**
3. Verifica que dice "Sepolia (11155111)"
4. Click en "Deploy"
5. Confirma la transacción en tu wallet

## Paso 6: Financiar el contrato
Después de desplegar, envía ETH al contrato:
1. Copia la dirección del contrato desplegado
2. En tu wallet, envía 1-2 ETH de Sepolia al contrato
3. Esto permitirá que el faucet tenga fondos para distribuir

## Paso 7: Configurar en la aplicación
1. Copia la dirección del contrato desplegado
2. Me la pasas y yo la configuro en el archivo `faucetConfig.ts`

---

## 📋 Información del contrato

- **Cantidad por solicitud:** 0.01 ETH (según el contrato)
- **Cooldown:** 5 minutos (300 segundos)
- **Chain ID de Sepolia:** 11155111

---

## ✅ Después del despliegue

Cuando tengas la dirección del contrato, dime y yo actualizo:
- `faucetConfig.ts` con tu dirección
- Los valores por defecto en `FaucetViewRealContract.svelte`

