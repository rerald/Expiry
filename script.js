// DOM 요소들
const checklistForm = document.getElementById('checklistForm');
const resultButton = document.getElementById('resultButton');
const resultSection = document.getElementById('result');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const consultationForm = document.getElementById('consultationForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const phoneFeedback = document.getElementById('phoneFeedback');
const submitSuccess = document.getElementById('submitSuccess');
const videoThumbnail = document.getElementById('videoThumbnail');
const videoModal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');
const videoClose = document.querySelector('.video-close');

// 체크리스트 폼 상태 관리
let formData = {};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeChecklistForm();
    initializeConsultationForm();
    initializeVideoModal();
    initializeScrollAnimations();
});

// 체크리스트 폼 초기화
function initializeChecklistForm() {
    const formInputs = checklistForm.querySelectorAll('input, select');
    
    formInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateFormData();
            validateForm();
        });
    });
    
    checklistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateResult();
    });
}

// 폼 데이터 업데이트
function updateFormData() {
    const formInputs = checklistForm.querySelectorAll('input, select');
    formData = {};
    
    formInputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else {
            formData[input.name] = input.value;
        }
    });
}

// 폼 유효성 검사
function validateForm() {
    const requiredFields = ['tax_type', 'tax_year', 'recent_collection', 'seizure_lawsuit', 'tax_amount'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field] === '') {
            isValid = false;
        }
    });
    
    resultButton.disabled = !isValid;
    
    if (isValid) {
        resultButton.classList.remove('disabled');
    } else {
        resultButton.classList.add('disabled');
    }
}

// 결과 계산 로직
function calculateResult() {
    let score = 0;
    const currentYear = new Date().getFullYear();
    const taxYear = parseInt(formData.tax_year);
    const yearsDiff = currentYear - taxYear;
    
    // 1. 세금 종류별 점수 (기본 소멸시효 기간 고려)
    if (formData.tax_type === 'income' || formData.tax_type === 'vat') {
        score += yearsDiff >= 5 ? 30 : (yearsDiff >= 3 ? 20 : 10);
    } else if (formData.tax_type === 'corporate') {
        score += yearsDiff >= 5 ? 25 : (yearsDiff >= 3 ? 15 : 5);
    } else {
        score += yearsDiff >= 5 ? 20 : (yearsDiff >= 3 ? 10 : 0);
    }
    
    // 2. 경과 연수별 추가 점수
    if (yearsDiff >= 7) {
        score += 25;
    } else if (yearsDiff >= 5) {
        score += 20;
    } else if (yearsDiff >= 3) {
        score += 10;
    }
    
    // 3. 최근 징수 조치 여부 (소멸시효 중단 요인)
    if (formData.recent_collection === 'no') {
        score += 25;
    } else {
        score -= 20;
    }
    
    // 4. 압류/소송 여부 (소멸시효 중단 요인)
    if (formData.seizure_lawsuit === 'no') {
        score += 20;
    } else {
        score -= 25;
    }
    
    // 5. 세액 규모별 점수
    if (formData.tax_amount === 'under_10m') {
        score += 10;
    } else if (formData.tax_amount === '10m_50m') {
        score += 5;
    } // over_50m은 점수 추가 없음
    
    // 결과 등급 결정
    let resultLevel;
    if (score >= 70) {
        resultLevel = 'high';
    } else if (score >= 40) {
        resultLevel = 'medium';
    } else {
        resultLevel = 'low';
    }
    
    displayResult(resultLevel, score);
}

// 결과 표시
function displayResult(level, score) {
    const results = {
        high: {
            icon: '😊',
            title: '소멸 가능성 높음!',
            message: `축하드립니다. 현재 상황으로 보아 <strong>체납 세금이 소멸될 가능성이 매우 높습니다.</strong> 이제 남은 기간 동안 조심하기만 하면 세금 부담에서 벗어날 수 있을 것으로 예상됩니다. 정확한 확인과 절차 진행을 위해 전문가와 상담해 보세요!`
        },
        medium: {
            icon: '😐',
            title: '소멸 가능성 중간',
            message: `일부 조건은 충족되었지만 <strong>아직 확실하지 않은 상황</strong>입니다. 소멸시효 혜택을 받으려면 몇 가지 추가 확인이 필요합니다. 전문가가 사용자님의 상태를 면밀히 검토하여 최선의 해결책을 찾아드릴 수 있으니, 상담을 받아보시는 것을 권장드립니다.`
        },
        low: {
            icon: '😟',
            title: '소멸 가능성 낮음',
            message: `현재로서는 <strong>자동 소멸 가능성이 낮아</strong> 보입니다. 하지만 걱정하지 마세요. 소멸시효가 아니더라도 분납 협의, 감면 신청 등 다른 방법으로 부담을 줄일 길이 있습니다. 포기하지 마시고, 세무 전문가와 상의하여 새로운 해결책을 모색해보세요.`
        }
    };
    
    const result = results[level];
    
    // 결과 섹션 업데이트
    resultIcon.textContent = result.icon;
    resultIcon.className = `result-icon ${level}`;
    
    resultTitle.textContent = result.title;
    resultTitle.className = `result-title ${level}`;
    
    resultMessage.innerHTML = result.message;
    
    // 결과 섹션 표시 및 스크롤
    resultSection.style.display = 'block';
    
    // 부드러운 스크롤 애니메이션
    setTimeout(() => {
        scrollToSection('result');
    }, 100);
}

// 상담 신청 폼 초기화
function initializeConsultationForm() {
    phoneInput.addEventListener('input', validatePhone);
    consultationForm.addEventListener('submit', handleConsultationSubmit);
}

// 전화번호 유효성 검사
function validatePhone() {
    const phone = phoneInput.value.trim();
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    
    phoneFeedback.textContent = '';
    phoneFeedback.className = 'input-feedback';
    
    if (phone === '') {
        return false;
    }
    
    if (phoneRegex.test(phone.replace(/\D/g, ''))) {
        phoneFeedback.textContent = '유효한 전화번호입니다.';
        phoneFeedback.classList.add('valid');
        return true;
    } else {
        phoneFeedback.textContent = '올바른 휴대전화 번호를 입력해주세요. (예: 010-1234-5678)';
        phoneFeedback.classList.add('invalid');
        return false;
    }
}

// 상담 신청 폼 제출 처리
async function handleConsultationSubmit(e) {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const privacyAgree = document.getElementById('privacyAgree').checked;
    
    // 유효성 검사
    if (name === '') {
        alert('이름을 입력해주세요.');
        nameInput.focus();
        return;
    }
    
    if (!validatePhone()) {
        alert('올바른 휴대전화 번호를 입력해주세요.');
        phoneInput.focus();
        return;
    }
    
    if (!privacyAgree) {
        alert('개인정보 수집 및 이용에 동의해주세요.');
        return;
    }
    
    // 제출 버튼 비활성화
    const submitButton = consultationForm.querySelector('.submit-button');
    submitButton.disabled = true;
    submitButton.textContent = '신청 중...';
    
    try {
        // 여기서 실제 서버로 데이터 전송
        // 현재는 시뮬레이션
        await simulateFormSubmission({
            name: name,
            phone: phone,
            checklistResult: formData,
            timestamp: new Date().toISOString()
        });
        
        // 성공 시 폼 숨기고 성공 메시지 표시
        consultationForm.style.display = 'none';
        submitSuccess.style.display = 'block';
        
    } catch (error) {
        alert('일시적인 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('Form submission error:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '상담 신청하기';
    }
}

// 폼 제출 시뮬레이션 (실제 구현 시 서버 API 호출로 대체)
function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('상담 신청 데이터:', data);
            
            // 로컬 스토리지에 저장 (실제 구현 시 서버 전송)
            const submissions = JSON.parse(localStorage.getItem('consultationSubmissions') || '[]');
            submissions.push(data);
            localStorage.setItem('consultationSubmissions', JSON.stringify(submissions));
            
            resolve();
        }, 1500);
    });
}

// 비디오 모달 초기화
function initializeVideoModal() {
    videoThumbnail.addEventListener('click', openVideoModal);
    videoClose.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.style.display !== 'none') {
            closeVideoModal();
        }
    });
}

// 비디오 모달 열기
function openVideoModal() {
    // 실제 비디오 URL 설정 (YouTube 예시)
    const videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
    videoPlayer.src = videoUrl;
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 비디오 모달 닫기
function closeVideoModal() {
    videoPlayer.src = '';
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 스크롤 애니메이션 초기화
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들
    const animateElements = document.querySelectorAll('.empathy-content, .section-header, .question-item, .social-proof, .case-card, .cases-cta');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// 섹션으로 스크롤
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const yOffset = -20; // 헤더 여백
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
    }
}

// 전화번호 자동 포맷팅
function formatPhoneNumber(input) {
    const value = input.value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (value.length <= 3) {
        formattedValue = value;
    } else if (value.length <= 7) {
        formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
        formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    
    input.value = formattedValue;
}

// 전화번호 입력 시 자동 포맷팅 적용
phoneInput.addEventListener('input', function() {
    formatPhoneNumber(this);
});

// 스크롤 이벤트로 헤더 스타일 변경 (선택사항)
window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    const introSection = document.getElementById('intro');
    
    if (scrollY > introSection.offsetHeight / 2) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

// 페이지 로딩 애니메이션
window.addEventListener('load', function() {
    const introElements = document.querySelectorAll('.headline, .subheadline, .video-container, .cta-button');
    
    introElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            
            // 애니메이션 적용
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, index * 200);
    });
});

// 터치 이벤트 최적화 (모바일)
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // 터치 피드백 개선
    const buttons = document.querySelectorAll('button, .radio-option, .checkbox-label');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.classList.add('touched');
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touched');
            }, 150);
        });
    });
}

// 개발자 도구용 디버그 함수들
window.debugLanding = {
    getFormData: () => formData,
    simulateResult: (level) => displayResult(level, 50),
    getSubmissions: () => JSON.parse(localStorage.getItem('consultationSubmissions') || '[]'),
    clearSubmissions: () => localStorage.removeItem('consultationSubmissions')
};

// 에러 핸들링
window.addEventListener('error', function(e) {
    console.error('랜딩페이지 오류:', e);
    
    // 사용자에게 보이지 않는 오류 로깅
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.message,
            fatal: false
        });
    }
});

// 폼 자동저장 (선택사항)
function saveFormProgress() {
    if (Object.keys(formData).length > 0) {
        localStorage.setItem('checklistProgress', JSON.stringify(formData));
    }
}

function loadFormProgress() {
    const saved = localStorage.getItem('checklistProgress');
    if (saved) {
        try {
            const savedData = JSON.parse(saved);
            
            // 저장된 데이터로 폼 복원
            Object.keys(savedData).forEach(name => {
                const input = document.querySelector(`[name="${name}"]`);
                if (input) {
                    if (input.type === 'radio') {
                        const radioInput = document.querySelector(`[name="${name}"][value="${savedData[name]}"]`);
                        if (radioInput) radioInput.checked = true;
                    } else {
                        input.value = savedData[name];
                    }
                }
            });
            
            updateFormData();
            validateForm();
        } catch (e) {
            console.error('저장된 폼 데이터 로드 실패:', e);
        }
    }
}

// 페이지 언로드 시 진행상황 저장
window.addEventListener('beforeunload', saveFormProgress);

// 페이지 로드 시 저장된 진행상황 복원
document.addEventListener('DOMContentLoaded', loadFormProgress); 