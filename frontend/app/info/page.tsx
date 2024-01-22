

const Info = () => {
    return (
        <div className="flex min-h-screen flex-col items-center bg-black text-[#f5f5dc] p-24 brightness-75">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">What is MemoPool?</h1>
                <section>
                    <h2 className="text-lg font-semibold mt-8 mb-4">TLDR, this app aims to draw connections between your past thoughts and current thoughts to spark new insights, rekindle old memories, and learn more about yourself — all while we collect ZERO information about identity.</h2>
                    <p>Here is a demo of how we spark these connections: TBA</p>
                </section>
                <h1 className="text-3xl font-bold mt-10 mb-4">How to Use MemoPool</h1>
                <section>
                    <h2 className="text-xl font-semibold mt-8 mb-2 underline">Key Features</h2>
                    <ul className="list-disc list-inside">
                        <li><strong>Anonymity and Privacy:</strong> We do not require any personal information to use our service.</li>
                        <li><strong>Key ID System:</strong> A unique key ID lets you access your memos across sessions or devices.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mt-8 mb-2 underline">Generating and Using Your Key ID</h2>
                    <p className="mt-1"><strong>Generating Your Key ID</strong>: Click &quot;Generate Key&quot; to get your unique key ID.</p>
                    <p className="mt-1"><strong className="mt-4">Saving Your Key ID</strong>: Store your key ID securely; it&apos;s essential for accessing your memos.</p>
                    <p className="mt-1"><strong className="mt-4">Retrieving Your Session with Key ID</strong>: Enter your key ID to retrieve your session and access your memos.</p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mt-8 mb-2 underline">FAQ</h2>
                    <strong>What happens if I lose my key ID?</strong> 
                    <p className="mb-4">It&apos;s crucial to store your key ID securely as losing it can prevent access to your memos.</p>
                    <strong>Can I generate a new key ID?</strong> 
                    <p>Yes, but it will be linked to your current session and memos.</p>
                </section>
                <h1 className="text-3xl font-bold mt-10 mb-6">Public MemoPool</h1>
                <p className="mb-4">Again, we collect zero information about your identity. This stems from our belief that a user should have full control over what they want to share or not.</p>
                <p>That being said, if you wish to voluntarily share memos into the public MemoPool, you have the capability to.</p>
            </div>
        </div>
    )
}

export default Info;
