document.addEventListener("DOMContentLoaded", () => {

    // --- FIX: Check if the comment section exists before running any code ---
    const commentSection = document.getElementById('comment-section');
    if (!commentSection) {
        return; // Exit the script if not on a details/player page
    }

    const { createClient } = supabase;
    const SUPABASE_URL = 'https://hwucnfgzeghfmagromyb.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3dWNuZmd6ZWdoZm1hZ3JvbXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzUwMjMsImV4cCI6MjA3MDIxMTAyM30.Sl8JjfFj9iEWZxwun9XzaZeQcEN1BtfcU2FmlGdemI8';

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- Core Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get('id');
    const pageType = urlParams.get('type');
    const pageTopic = (pageId && pageType) 
        ? `${pageType}-${pageId}` 
        : window.location.pathname;

   
    const authModal = document.getElementById('authModal');
    const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    const showAuthModalBtn = document.getElementById('showAuthModalBtn');
    const loginPrompt = document.getElementById('loginPrompt');
    const commentFormContainer = document.getElementById('commentFormContainer');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submit');
    const logoutBtn = document.getElementById('logoutBtn');

    const avatarModal = document.getElementById('avatarModal');
    const closeAvatarModalBtn = document.getElementById('closeAvatarModalBtn');
    const currentUserAvatarImg = document.getElementById('currentUserAvatar');
    const currentUsernameDisplay = document.getElementById('currentUsernameDisplay');
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');


    let currentUser = null;
    let selectedAvatar = "https://cdn-icons-png.flaticon.com/128/1046/1046929.png";
    let sortRecent = true;
    let globalReplyIndex = 1;
    let isReacting = false;

   const avatarData = {
      person: [ "https://cdn-icons-png.flaticon.com/128/4139/4139981.png", "https://cdn-icons-png.flaticon.com/128/4140/4140057.png", "https://cdn-icons-png.flaticon.com/128/4140/4140077.png", "https://cdn-icons-png.flaticon.com/128/2202/2202112.png", "https://cdn-icons-png.flaticon.com/128/4140/4140061.png", "https://cdn-icons-png.flaticon.com/128/4140/4140037.png", "https://cdn-icons-png.flaticon.com/128/4140/4140051.png", "https://cdn-icons-png.flaticon.com/128/4139/4139951.png", "https://cdn-icons-png.flaticon.com/128/4140/4140060.png", "https://cdn-icons-png.flaticon.com/128/6997/6997662.png", "https://cdn-icons-png.flaticon.com/128/4140/4140040.png", "https://cdn-icons-png.flaticon.com/128/4140/4140047.png" ],
      animal: [ "https://cdn-icons-png.flaticon.com/128/4322/4322991.png", "https://cdn-icons-png.flaticon.com/128/4775/4775614.png", "https://cdn-icons-png.flaticon.com/128/4775/4775640.png", "https://cdn-icons-png.flaticon.com/128/1326/1326390.png", "https://cdn-icons-png.flaticon.com/128/9308/9308861.png", "https://cdn-icons-png.flaticon.com/128/9308/9308872.png", "https://cdn-icons-png.flaticon.com/128/1326/1326415.png", "https://cdn-icons-png.flaticon.com/128/9308/9308930.png", "https://cdn-icons-png.flaticon.com/128/1760/1760998.png", "https://cdn-icons-png.flaticon.com/128/1326/1326401.png", "https://cdn-icons-png.flaticon.com/128/4775/4775517.png", "https://cdn-icons-png.flaticon.com/128/9308/9308916.png", "https://cdn-icons-png.flaticon.com/128/3940/3940435.png", "https://cdn-icons-png.flaticon.com/128/6740/6740990.png", "https://cdn-icons-png.flaticon.com/128/4775/4775608.png", "https://cdn-icons-png.flaticon.com/128/1005/1005364.png", "https://cdn-icons-png.flaticon.com/128/6740/6740990.png", "https://cdn-icons-png.flaticon.com/128/4775/4775608.png" ],
      animation: [ "https://i.pinimg.com/1200x/f5/44/96/f544962a7b3129c0637ac2ae3822ce04.jpg", "https://i.pinimg.com/1200x/17/86/c4/1786c496eb64a64f81181de49638d713.jpg", "https://i.pinimg.com/736x/6d/d0/73/6dd073b2fa2e8e85b3667f76a233300c.jpg", "https://i.pinimg.com/736x/0b/41/df/0b41dff69b51c42493489ed10eada7ee.jpg", "https://i.pinimg.com/1200x/57/c4/ac/57c4acf284c8278a97dd862b90d0a7f6.jpg", "https://i.pinimg.com/736x/8b/38/fe/8b38fe784ebdef337b2e5925e849b865.jpg", "https://i.pinimg.com/736x/f7/2c/d1/f72cd11d081fda86f6defac97834fa6a.jpg", "https://i.pinimg.com/736x/22/dc/88/22dc88835f11c148a26724be02ba37d6.jpg", "https://i.pinimg.com/736x/08/97/a3/0897a36b7d6da0a57ee8a1fed7f67bbc.jpg", "https://i.pinimg.com/736x/4f/50/5b/4f505b0e22c2fb9de8df11606d63aee3.jpg", "https://i.pinimg.com/1200x/cf/40/37/cf40375b3ad057d3b6759fd7b5cfc69b.jpg", "https://i.pinimg.com/736x/21/da/6a/21da6af1a11272715f67c3d5ccac4941.jpg", "https://i.pinimg.com/736x/71/d8/00/71d8003e7580495d0bafd80eccd3b3c0.jpg", "https://i.pinimg.com/736x/be/38/78/be3878c34f93d1663a6e5f6af4b78e9c.jpg", "https://i.pinimg.com/736x/33/3d/d0/333dd06be42713804de17ae38caa0680.jpg", "https://i.pinimg.com/1200x/dc/89/44/dc8944d0b4f1174080edb5bb66e97eaf.jpg", "https://i.pinimg.com/736x/a7/6e/32/a76e3272f50feb992792ee874910d233.jpg", "https://i.pinimg.com/1200x/77/70/3f/77703fafc70fcf5e37089acd53fd514a.jpg" ],
      emoji: [ "https://i.pinimg.com/736x/5b/8b/26/5b8b26358e27e259ca5b308adb0007d9.jpg", "https://i.pinimg.com/1200x/4e/ed/e3/4eede304ca4f6bfcc857e9343c33fc95.jpg", "https://i.pinimg.com/1200x/15/e8/32/15e832be938d0e6ed7266bf789d71bb7.jpg", "https://i.pinimg.com/1200x/87/a6/a3/87a6a35d663a034c38bdf8b7be022acd.jpg", "https://i.pinimg.com/1200x/43/27/bd/4327bd2cf07e8311bcf05fce38aedc9a.jpg", "https://i.pinimg.com/1200x/08/16/61/081661bd0bf7ec4b45d4fc3dd820a60f.jpg", "https://i.pinimg.com/1200x/23/c0/06/23c00684fe980429026b8d012e64f25c.jpg", "https://i.pinimg.com/1200x/2a/34/06/2a3406c7a142f9173536f3f7d744edc5.jpg", "https://i.pinimg.com/736x/9e/f1/84/9ef1846a74700af02e30898ff0e4b730.jpg", "https://i.pinimg.com/736x/8b/43/0a/8b430af942a8482b1b817a38725adc18.jpg", "https://i.pinimg.com/736x/53/ea/b3/53eab3d0b5babe47d2808e8353176127.jpg", "https://i.pinimg.com/1200x/b1/7f/b5/b17fb561e2092833380731bc6553fa1f.jpg", "https://i.pinimg.com/736x/ff/67/8e/ff678e727c07cd355797551d5f468f89.jpg", "https://i.pinimg.com/736x/2e/f4/33/2ef433ecf11c3c52d21c83e0a8a05f2c.jpg", "https://i.pinimg.com/736x/ea/98/95/ea989550c5533f9682859bd79fc6be01.jpg", "https://i.pinimg.com/1200x/0e/68/de/0e68de2be0c8f1ddd5fe87aa3ca304d7.jpg", "https://i.pinimg.com/1200x/6c/a9/4b/6ca94b596e161af20fe4738eadf18eef.jpg", "https://i.pinimg.com/1200x/ca/f2/ee/caf2ee640db02286ed2c3617178ec958.jpg" ]
    };

    let currentReactions = {};

    async function loadReactions() {
        if (!pageTopic || pageTopic === window.location.pathname) { return; }
        let { data, error } = await supabaseClient.from('reactions').select('*').eq('topic', pageTopic).single();
        if (error && error.code === 'PGRST116') {
            const { data: newReactionData, error: insertError } = await supabaseClient.from('reactions').insert({ topic: pageTopic, upvote: 0, funny: 0, love: 0, surprised: 0, angry: 0, sad: 0 }).select().single();
            if (insertError) { console.error('Error creating new reaction entry:', insertError); return; }
            data = newReactionData;
        } else if (error) { console.error('Error fetching reactions:', error); return; }
        currentReactions = data;
        updateReactionUI();
    }

    function updateReactionUI() {
        if (!currentReactions || !currentReactions.topic) return;
        let total = 0;
        for (const reaction in currentReactions) {
            if (reaction !== 'topic' && reaction !== 'id' && reaction !== 'created_at') {
                const countElement = document.getElementById(`${reaction}-count`);
                if (countElement) {
                    const count = currentReactions[reaction] || 0;
                    countElement.textContent = count;
                    total += count;
                }
            }
        }
        document.getElementById('totalResponses').textContent = total;
        const userReacted = localStorage.getItem(pageTopic);
        document.querySelectorAll('.reaction').forEach(el => {
            el.classList.remove('reacted');
            if (el.dataset.reaction === userReacted) { el.classList.add('reacted'); }
        });
    }

    async function handleReactionClick(newReaction) {
        if (isReacting) return;
        isReacting = true;
        const previousReaction = localStorage.getItem(pageTopic);
        let rpcCall;
        if (previousReaction === newReaction) {
            localStorage.removeItem(pageTopic);
            rpcCall = supabaseClient.rpc('decrement_reaction', { topic_name: pageTopic, reaction_name: newReaction });
        } else if (previousReaction) {
            localStorage.setItem(pageTopic, newReaction);
            rpcCall = supabaseClient.rpc('switch_reaction', { topic_name: pageTopic, old_reaction_name: previousReaction, new_reaction_name: newReaction });
        } else {
            localStorage.setItem(pageTopic, newReaction);
            rpcCall = supabaseClient.rpc('increment_reaction', { topic_name: pageTopic, reaction_name: newReaction });
        }
        const { error } = await rpcCall;
        if (error) { console.error('Failed to update reaction in the database:', error); }
        await loadReactions();
        isReacting = false;
    }

    async function updateUIForAuth(session) {
        currentUser = session?.user || null;
        if (currentUser) {
            loginPrompt.style.display = 'none';
            commentFormContainer.style.display = 'block';
            let username = currentUser.user_metadata?.username || currentUser.email;
            if (currentUser.is_anonymous) username = 'Guest User';
            currentUsernameDisplay.textContent = username;
            selectedAvatar = currentUser.user_metadata?.profile_url || "https://cdn-icons-png.flaticon.com/128/1046/1046929.png";
            currentUserAvatarImg.src = selectedAvatar;
        } else {
            loginPrompt.style.display = 'block';
            commentFormContainer.style.display = 'none';
            currentUsernameDisplay.textContent = 'Guest';
            messageInput.value = '';
            selectedAvatar = "https://cdn-icons-png.flaticon.com/128/1046/1046929.png";
            currentUserAvatarImg.src = selectedAvatar;
        }
        loadComments();
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateUIForAuth(session);
    });

    document.getElementById('signInBtn').addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
        else authModal.style.display = 'none';
    });

    document.getElementById('signUpBtn').addEventListener('click', async () => {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const username = document.getElementById('signupUsername').value.trim();
        if (!username) return alert("Please enter a display name for signup.");
        const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: { username, profile_url: "https://cdn-icons-png.flaticon.com/128/1046/1046929.png" } } });
        if (error) alert(error.message);
        else if (data.user) {
            alert('Signed up successfully! Please check your email to confirm your account.');
            authModal.style.display = 'none';
        }
    });

    document.getElementById('guestSignInBtn').addEventListener('click', async () => {
        const { data, error } = await supabaseClient.auth.signInAnonymously();
        if (error) {
            console.error("GUEST SIGN-IN FAILED:", error);
            alert(error.message);
        } else {
            authModal.style.display = 'none';
        }
    });

    logoutBtn.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) alert(error.message);
    });

    function toggleAuthModal() {
        authModal.style.display = authModal.style.display === 'block' ? 'none' : 'block';
        switchAuthTab('login');
    }

    function toggleAvatarModal() {
        avatarModal.style.display = avatarModal.style.display === 'block' ? 'none' : 'block';
        document.querySelectorAll('#avatarModal .tab-content img').forEach(i => i.classList.remove('selected'));
        const currentAvatarInModal = document.querySelector(`#avatarModal img[src="${selectedAvatar}"]`);
        if (currentAvatarInModal) currentAvatarInModal.classList.add('selected');
    }

    function switchAuthTab(tab) {
        document.querySelectorAll('#authModal .tab-content').forEach(el => el.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
        document.querySelectorAll('#authModal .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`#authModal .tab-btn[data-tab="${tab}"]`).classList.add('active');
    }

    function switchAvatarTab(tab) {
        const selector = `#avatarModal .tab-content`;
        document.querySelectorAll(selector).forEach(el => el.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
        document.querySelectorAll(`#avatarModal .tab-btn`).forEach(btn => btn.classList.remove('active'));
        document.querySelector(`#avatarModal .tab-btn[data-tab="${tab}"]`).classList.add('active');
    }
    showAuthModalBtn.addEventListener('click', toggleAuthModal);
    closeAuthModalBtn.addEventListener('click', toggleAuthModal);
    closeAvatarModalBtn.addEventListener('click', toggleAvatarModal);
    currentUserAvatarImg.addEventListener('click', toggleAvatarModal);
    document.querySelectorAll('#authModal .tab-btn').forEach(btn => btn.addEventListener('click', () => switchAuthTab(btn.dataset.tab)));
    document.querySelectorAll('#avatarModal .tab-btn').forEach(btn => btn.addEventListener('click', () => switchAvatarTab(btn.dataset.tab)));

    function createAvatarGrid() {
        Object.entries(avatarData).forEach(([key, urls]) => {
            const container = document.getElementById(key);
            if (!container) return;
            container.innerHTML = '';
            urls.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.addEventListener('click', () => {
                    document.querySelectorAll('#avatarModal .tab-content img').forEach(i => i.classList.remove('selected'));
                    img.classList.add('selected');
                    selectedAvatar = url;
                });
                container.appendChild(img);
            });
        });
    }

    saveAvatarBtn.addEventListener('click', async () => {
        if (!currentUser) return alert("You must be logged in to save an avatar.");
        const { data, error } = await supabaseClient.auth.updateUser({ data: { profile_url: selectedAvatar } });
        if (error) alert("Error saving avatar: " + error.message);
        else {
            if (data.user) {
                currentUser.user_metadata.profile_url = data.user.user_metadata.profile_url;
                currentUserAvatarImg.src = data.user.user_metadata.profile_url;
            }
            toggleAvatarModal();
            alert("Avatar saved successfully!");
        }
    });

    async function submitComment() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return toggleAuthModal();
        const message = messageInput.value.trim();
        let username = user.user_metadata?.username || user.email;
        if (user.is_anonymous) username = 'Guest User';
        const profileUrl = user.user_metadata?.profile_url || selectedAvatar;
        if (!message) return alert("Message is required.");
        const commentData = { user_id: user.id, username, message, profile_url: profileUrl, created_at: new Date().toISOString(), likes: 0, dislikes: 0, emoji: null, topic: pageTopic };
        const { error } = await supabaseClient.from('comments').insert([commentData]);
        if (error) {
            console.error("DATABASE ERROR:", error);
            alert("Could not post comment. See console for details.");
        } else {
            messageInput.value = '';
            loadComments();
        }
    }
    submitBtn.addEventListener('click', submitComment);

    async function submitReply(parentId, message) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return toggleAuthModal();
        let username = user.user_metadata?.username || user.email;
        if (user.is_anonymous) username = 'Guest User';
        const profileUrl = user.user_metadata?.profile_url || selectedAvatar;
        const { error } = await supabaseClient.from('comments').insert([{ user_id: user.id, username, message, profile_url: profileUrl, created_at: new Date().toISOString(), parent_id: parentId, likes: 0, dislikes: 0, emoji: null, topic: pageTopic }]);
        if (error) {
            console.error("DATABASE ERROR on reply:", error);
            alert("Error submitting reply. See console for details.");
        } else loadComments();
    }

    function timeAgo(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    const customDropdown = document.getElementById('customSortDropdown');
    const selectedOption = customDropdown.querySelector('.selected-option');
    const optionsList = customDropdown.querySelector('.dropdown-options');

    selectedOption.addEventListener('click', () => {
        optionsList.style.display = optionsList.style.display === 'block' ? 'none' : 'block';
    });
    optionsList.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', () => {
            optionsList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            option.classList.add('active');
            selectedOption.innerText = option.innerText;
            optionsList.style.display = 'none';
            sortRecent = option.dataset.value === 'recent';
            loadComments();
        });
    });
    document.addEventListener('click', (e) => {
        if (!customDropdown.contains(e.target)) {
            optionsList.style.display = 'none';
        }
    });

    async function handleLikeDislike(id, type) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return toggleAuthModal();
        const { data, error } = await supabaseClient.from('comments').select(type).eq('id', id).single();
        if (error) { console.error(`Error fetching ${type} count:`, error); return; }
        const newCount = (data[type] || 0) + 1;
        const { error: updateError } = await supabaseClient.from('comments').update({ [type]: newCount }).eq('id', id);
        if (updateError) {
            console.error(`Error updating ${type} count:`, updateError);
            alert(`Could not update ${type}. See console for details.`);
        } else {
            loadComments();
        }
    }

    async function loadComments() {
        const { data, error } = await supabaseClient.from('comments').select('*').eq('topic', pageTopic).order('created_at', { ascending: !sortRecent });
        if (error) {
            if (error.code === 'PGRST116') {
                document.getElementById('comments-list').innerHTML = '';
                document.getElementById('commentCount').innerText = 0;
                return;
            }
            return console.error("Error loading comments:", error);
        }

        const list = document.getElementById('comments-list');
        list.innerHTML = '';
        const parents = data.filter(c => !c.parent_id);
        const replies = data.filter(c => c.parent_id);

        const renderComment = (comment, isReply = false) => {
            const div = document.createElement('div');
            const hasReplies = replies.some(r => r.parent_id === comment.id);
            let commentClasses = isReply ? 'comment reply-box' : 'comment';
            if (!hasReplies) { commentClasses += ' no-replies'; }
            div.className = commentClasses;

            div.innerHTML = `
              <div class="comment-header">
                <img src="${comment.profile_url}" />
                <div><strong>${comment.username}</strong> <small>${timeAgo(comment.created_at)}</small></div>
              </div>
              <div class="comment-body">${comment.message}</div>
              <div class="comment-footer">
                <span class="like-btn" data-id="${comment.id}"><i class="bi bi-hand-thumbs-up"></i> <span class="like-count">${comment.likes || 0}</span></span>
                <span class="dislike-btn" data-id="${comment.id}"><i class="bi bi-hand-thumbs-down"></i> <span class="dislike-count">${comment.dislikes || 0}</span></span>
                <span class="reply-btn" data-id="${comment.id}"><i class="bi bi-chat-left-text"></i> Reply</span>
              </div>
              <div class="replies"></div>`;

            const repliesBox = div.querySelector('.replies');
            div.querySelector('.like-btn').addEventListener('click', () => handleLikeDislike(comment.id, 'likes'));
            div.querySelector('.dislike-btn').addEventListener('click', () => handleLikeDislike(comment.id, 'dislikes'));
            div.querySelector('.reply-btn').addEventListener('click', () => {
                repliesBox.innerHTML = '';
                if (!currentUser) return toggleAuthModal();
                const replyForm = document.createElement('div');
                replyForm.innerHTML = `<textarea placeholder="What's on your mind?" class="reply-message"></textarea><button class="comment-btn reply-submit">Submit Reply</button>`;
                repliesBox.appendChild(replyForm);
                replyForm.querySelector('.reply-submit').addEventListener('click', async () => {
                    const msg = replyForm.querySelector('.reply-message').value.trim();
                    if (msg) await submitReply(comment.id, msg);
                    else alert("Reply message required");
                });
            });

            replies.filter(r => r.parent_id === comment.id).forEach(reply => {
                const replyEl = renderComment(reply, true);
                replyEl.classList.add(`reply-${globalReplyIndex++}`);
                repliesBox.appendChild(replyEl);
            });
            return div;
        };

        document.getElementById('commentCount').innerText = data.length;
        parents.forEach(parent => list.appendChild(renderComment(parent)));
        markLastReplies();
    }

    function markLastReplies() {
        document.querySelectorAll('.comment.reply-box.last-reply').forEach(_el => {
            _el.classList.remove('last-reply');
        });
        document.querySelectorAll('.replies').forEach(_repliesBox => {
            const replyBoxes = _repliesBox.querySelectorAll('.comment.reply-box');
            if (replyBoxes.length > 0) {
                replyBoxes[replyBoxes.length - 1].classList.add('last-reply');
            }
        });
    }

    window.onload = async () => {
        createAvatarGrid();
        loadReactions();
        const { data: { session } } = await supabaseClient.auth.getSession();
        updateUIForAuth(session);
        document.querySelectorAll('.reaction').forEach(el => {
            el.addEventListener('click', () => handleReactionClick(el.dataset.reaction));
        });
    };
});
