

const Info = () => {
    return (
        <div className="flex min-h-screen flex-col items-center bg-black text-[#655a5a] font-mono brightness-150 p-24">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4 brightness-150">What is MemoPool?</h1>
                <section>
                    <h2 className="text-lg font-semibold mt-8 mb-4">
                        <p className="underline mb-2 brightness-125">TLDR</p>
                        Think Apple Notes but with the optionality to post notes privately or publicly, with GPT-4 
                        capabilities to analyze each note to better provide insights. Seamless optionality for the user 
                        to either privatize or post memos in the MemoPool social network, all while having ZERO info collected about identity.
                    </h2>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mt-8 mb-2 underline brightness-125">Key Features</h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Anonymity and Privacy:</strong> We do not require any personal information to use any aspects of MemoPool.</li>
                        <li><strong>GPT-4 powered memo analysis:</strong> We use GPT-4 under the hood to analyze memos, which could allow the user to spark new insights, synthesize past thoughts, and learn more about themselves in a way that a traditional note-taking app cannot.</li>
                        <li><strong>Optionality to post in public MemoPool social network:</strong> If the user wants to publicize memos to the public MemoPool, they can create their own User ID — tying it with their key ID. Creation of a User ID is completely optional, and does not restrict a user from viewing memos in the public MemoPool.</li>
                        <li><strong>Key ID system:</strong> A unique key ID lets you access your memos across sessions or devices. <span className="underline">When generating a key ID, please remember to store your key ID somewhere you can remember it</span>. All of your memos are tied to this!</li> 
                        <li><strong>Intuitive ease of use:</strong> MemoPool was designed with simplicity in mind — Apple Notes was a large inspiration in terms of ease of use and just to ability to quickly jot down a thought without much overhead.</li>
                    </ul>
                </section>
                <hr className="border-dotted mt-10"></hr>
                <h1 className="text-3xl font-bold mt-10 mb-4 brightness-150">How to Use MemoPool</h1>
                <section>
                    <h2 className="text-xl font-semibold mt-8 mb-2 underline brightness-125">Generating and Using Your Key ID</h2>
                    <p className="mt-1"><strong>Generating Your Key ID</strong>: Click the &quot;Generate Key&quot; button to get your unique key ID.</p>
                    <p className="mt-1"><strong className="mt-4">Saving Your Key ID</strong>: Store your key ID securely; it&apos;s essential for accessing your memos.</p>
                    <p className="mt-1"><strong className="mt-4">Retrieving Your Memos with Key ID</strong>: Enter your key ID to retrieve your session and access your memos.</p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mt-8 mb-2 underline brightness-125">Posting and Finding Similar Memos</h2>
                    <p className="mt-1"><strong>Posting</strong>: Just simply fill out the form and click submit on the home page!</p>
                    <p className="mt-1"><strong className="mt-4">Finding Similar Memos</strong>: Finding similar memos to a specific posted memo could be found in two ways: either immediately after posting (clicking the See Similar Memos button), or while accessing all personal memos and clicking the See Similar Memos button on the bottom of each memo there. </p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mt-8 mb-2 underline brightness-125">Accessing and Posting in the Public MemoPool</h2>
                    <p className="mt-1"><strong>Accessing the Public MemoPool</strong>: Click on the See Public MemoPool button in the home page. You do not need to have a userId to access.</p>
                    <p className="mt-1"><strong className="mt-4">Posting in the Public MemoPool</strong>: After each posted memo, there is a Private&lt; &gt;Public toggle which allows the user to decide whether a memo should be private or public. By default, memos are private. If users want to be identified in the public MemoPool, they should elect to change their user ID in the Personal Memos page.</p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mt-8 mb-2 underline brightness-125">FAQ</h2>
                    <strong>What happens if I lose my key ID?</strong> 
                    <p className="mb-4">It&apos;s crucial to store your key ID securely as losing it can prevent access to your memos.</p>
                    <strong>Can I generate a new key ID?</strong> 
                    <p>Yes, but it will be linked to a new account with zero existing memos upon generation. We plan on potentially adding more safeguards in the future, but for now please remember to store your key!</p>
                </section>
                <hr className="border-dotted mt-10"></hr>
                <h1 className="text-3xl font-bold mt-10 mb-6 brightness-150">Public MemoPool</h1>
                <p className="mb-4">The public MemoPool provides an ability for the user to publicize their memos and interact with others&apos; memos if they wish to. This garners a social network-like capability for MemoPool, and provides optionality and increased capability if the user wishes. Again, we collect zero information about your identity. This stems from our belief that a user should have full control over what they want to share or not.</p>
            </div>
            <a href="/" className='text-gray-500 pt-10 font-mono rounded-lg hover:opacity-80 pt-10 brightness-50'>
                {'<'}{'<'}{'<'} Home
            </a>
        </div>
    )
}

export default Info;
