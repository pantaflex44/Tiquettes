import "./wizard.css";

export default function Wizard({
                                   wizard,
                                   onCancel = null,
                                   onSave = null,
                               }) {
    return (
        <>
            <h3>Bienvenue dans l&#39;assistant de conception d&#39;un projet résidentiel.</h3>
            <div className="wizardDescription">Concevez votre projet résidentiel pas à pas. Indiquez la configuration de votre habitation, puis laissez votre humble assistant vous proposer un projet complet !</div>
            <div className="wizard">
                <button onClick={() => { if(onCancel && confirm("Vous êtes sur le point de quitter l'assistant de conception sans sauvegarder votre travail ! Cette action est irreversible.\r\n\r\nÊtes-vous certain de vouloir effectuer cette action ?")) onCancel();}}>Quitter l'assistant</button>
            </div>
        </>
    );
};