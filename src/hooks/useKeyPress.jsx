/** 

PR #109 - useKeyPress : le callback n'est plus appelé deux fois par appui
https://github.com/pantaflex44/Tiquettes/pull/109
par Théo BARRAGUÉ - https://github.com/theobarrague

Problème
Dans src/hooks/useKeyPress.jsx, le callback était déclenché à la fois dans le handler keydown et dans le handler keyup. Un seul appui sur une touche (ex. Entrée dans une popup) exécutait donc l'action deux fois :

Popup.jsx:115 : useKeyPress("Enter", onOk, ...) → onOk exécuté 2 fois par appui sur Entrée (ex. onApplyModuleEditor dans l'éditeur de module, Editor.jsx:320)
Popup.jsx:116 : useKeyPress("Escape", onCancel, ...) → idem pour Échap
Le bug est présent depuis la création du hook (commit 5a99231, « Ajout des raccourcis claviers Escape et Enter dans les Popups ») : le callback() a été placé à côté des deux setKeyPressed(...) par symétrie, alors que seul l'état keyPressed a besoin des deux événements.

Correctif
upHandler ne fait plus que setKeyPressed(false) : le callback ne part qu'au keydown
Ajout de !e.repeat au keydown : maintenir la touche enfoncée (auto-repeat) ne redéclenche pas l'action
preventDefault/stopPropagation retirés du keyup (sans effet à ce moment-là)
Dépendances de l'effect corrigées : [targetKey, callback, preventDefault, activated] (stale closure sur le callback)

 */

import { useEffect, useState } from "react";

function useKeyPress(
	targetKey,
	callback = null,
	preventDefault = false,
	activated = true,
) {
	const [keyPressed, setKeyPressed] = useState(false);

	useEffect(() => {
		const downHandler = (e) => {
			if (e.key === targetKey && activated && !e.repeat) {
				if (preventDefault) {
					e.preventDefault();
					e.stopPropagation();
				}
				setKeyPressed(true);
				if (callback) callback();
			}
		};
		const upHandler = (e) => {
			if (e.key === targetKey && activated) {
				setKeyPressed(false);
			}
		};

		window.addEventListener("keydown", downHandler);
		window.addEventListener("keyup", upHandler);

		return () => {
			window.removeEventListener("keydown", downHandler);
			window.removeEventListener("keyup", upHandler);
		};
	}, [targetKey, callback, preventDefault, activated]);

	return keyPressed;
}

export default useKeyPress;
