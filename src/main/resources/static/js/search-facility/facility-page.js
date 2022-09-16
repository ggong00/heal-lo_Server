import makeElements from "../module/create-elememt.js";

//dom 접근
const $reviewLists = document.querySelector('.review-lists');
const $modal = document.getElementById('modal');
const $writeBtn = document.querySelector('.review-write');
const $orderBySelect = document.querySelector('.order-by-selector');

//다용도 전역변수
let isFirst = true;
const fcno = document.querySelector('.facility').dataset.fcno;

// 페이지네이션 설정
const limitPage = 10;     //  페이지 최대 생성 수
const onePageNum = 10;    //  1페이지에 최대 목록 수
let currentPage = 1;      //  현재 페이지

//초기 페이지 셋팅
reviewListRequest();
document.querySelector('.pagination-wrap').remove();

//리뷰작성 페이지 이동
$writeBtn.addEventListener('click',e => {
    location.href = `/reviews/${fcno}/add`;
})

$orderBySelect.addEventListener('change',() => reviewListRequest());

//비동기 통신 함수
function reviewListRequest() {

    // 검색 결과 수/ 평균 평점 조회
    fetch(`/reviews/${fcno}/total`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(jsonData => {
            currentPage = 1;

            //검색결과 체크
            if (jsonData.data.totalCount == 0) return;

            //기존노드 삭제
            [...$reviewLists.children].forEach(ele => ele.remove());
            $reviewLists.nextElementSibling?.remove();

            //총 검색 결과 표시
            const $resultCount = document.querySelector('.review-cnt')
            $resultCount.textContent = jsonData.data.totalCount;

            //리뷰 평균 수정
            document.querySelector('.review-header__main .text-score')
                .textContent = jsonData.data.fcscore;
            document.querySelector('.review-header__main .inner-star')
                .style.width = jsonData.data.fcscore * 20 + '%'

            //페이지네이션 생성
            const totalPage = Math.ceil(jsonData.data.totalCount / onePageNum);
            const paginationWrap = createPagination(totalPage);
            $reviewLists.after(paginationWrap);
        })
        .catch(error => console.log(error));
}

//리뷰 랜더링 함수
function reviewListRender(data) {
    const previewContents = data.rvcontents.substr(0,200) + '...';
    const isMoreview = data.rvcontents.length > 200;

    const reviewCard =
    makeElements('div',{class : 'review-card', id : `${data.rvno}`},
        data.login ? makeElements('div',{class : 'review-btn-wrap'},
            makeElements('button',{class : 'review-update btn-review'},'수정'),
            makeElements('button',{class : 'review-delete btn-review'},'삭제')) : '',
        makeElements('div',{class : 'review-card__info'},
            makeElements('div',{class : 'rating-score review-card__star'},
                makeElements('div',{class : 'review-text-score'},`${data.rvscore}점`),
                makeElements('div',{class : 'outer-star'},'★★★★★',
                    makeElements('span',{class : 'inner-star'},'★★★★★'))),
            makeElements('span',{class : 'user-name'},data.memninkname),
            makeElements('span',{class : 'date'},data.rvcdate),
            makeElements('p',{class : 'preview-contents'},isMoreview ? previewContents : data.rvcontents,
            isMoreview ? makeElements('div',{class : 'btn-moreview'},'더보기') : ''),
            makeElements('div',{class : 'preview-wrap'})));

    reviewCard.querySelector('.inner-star').style.width = data.rvscore*20 + '%';

    //더보기 이벤트
    reviewCard.querySelector('.btn-moreview')?.addEventListener('click',(e) => {
        const contents = reviewCard.querySelector('.preview-contents');
        contents.classList.toggle('moreview-on');

        if(contents.classList.contains('moreview-on')) {
            contents.textContent = data.rvcontents;
        } else {
            contents.textContent = previewContents;
        }
    });

    //이미지 미리보기 생성
    data.imageFiles?.forEach(ele => {
        const img =  document.createElement('img');
        img.setAttribute('src',`/images/${ele.ufsname}`);
        img.setAttribute('data-bs-toggle','modal');
        img.setAttribute('data-bs-target','#modal');
        img.style.cursor = 'pointer';
        reviewCard.querySelector('.preview-wrap').appendChild(img);

        img.addEventListener('click',e => {
            $modal.querySelector('img').src = e.target.src;
        })
    });

    //리뷰 수정버튼 이벤트
    reviewCard.querySelector('.review-update')?.addEventListener('click',ele => {
        window.location = `/reviews/${data.rvno}/edit`;
    })

    //리뷰 삭제버튼 이벤트
    reviewCard.querySelector('.review-delete')?.addEventListener('click',ele => {
        fetch(`/reviews/${data.rvno}`, {
            method: `DELETE`
        })
            .then(response => response.json())
            .then(jsonData => reviewListRequest())
            .catch(error => console.log(error));
    })
    return reviewCard;
}

//페이지네이션 생성 함수
function createPagination(totalPage) {

    //이전 페이지네이션 삭제
    $reviewLists.querySelector('.pagination-wrap')?.remove();

    //페이지네이션 wrap생성
    const paginationLis = [];
    const paginationWrap = document.createElement('li');
    const pagination = document.createElement('ul');
    paginationWrap.setAttribute('class', 'pagination-wrap');
    paginationWrap.setAttribute('aria-label', 'Page navigation example');
    pagination.setAttribute('class', 'pagination pagination-sm');
    paginationWrap.appendChild(pagination);

    //페이지 생성
    let pageLv = Math.ceil(currentPage/limitPage);
    let startIdx = currentPage;
    let lastIdx = currentPage + limitPage;

    for (startIdx; startIdx < lastIdx && startIdx <= totalPage; startIdx++) {
        const page = document.createElement('li');
        page.setAttribute('class', 'page-item');
        const a = document.createElement('a');
        a.setAttribute('class', `page-link shadow-none`);
        a.textContent = startIdx;

        // 페이지 클릭 이벤트
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const orderByValue = $orderBySelect.value;
            const target = e.target;
            target.textContent == 1 && isFirst ? location.href = '#' : location.href = '#review';
            console.log(target.textContent)
            isFirst = false;
            currentPage = parseInt(target.textContent);  //현재 페이지 저장

            //리뷰 조회
            const queryPram = `?pageNo=${currentPage}&numOfRow=${onePageNum}&orderBy=${orderByValue}`;
            fetch(`/reviews/${fcno}/list` + queryPram,{
                method : 'GET'
            })
                .then(response => response.json())
                .then(jsonData => {
                    // 이전 목록들 초기화
                    [...$reviewLists.children].filter(ele => ele.classList.contains('review-card'))
                        .forEach(ele => ele.remove());

                    //새 목록 생성
                    jsonData.data.reviews.forEach(ele => $reviewLists.appendChild(reviewListRender(ele)));

                    //클릭 표시
                    [...$reviewLists.nextElementSibling.querySelectorAll('a')].forEach(ele => ele.classList.remove('on'));
                    target.classList.add('on');

                })
                .catch(error => console.log(error))
        });
        page.appendChild(a);
        paginationLis.push(page);
        a.textContent == currentPage && a.click();
    }

    //이전 페이지 생성
    if(currentPage - limitPage > 0) {
        const page = document.createElement('li');
        page.setAttribute('class', 'page-item');
        const a = document.createElement('a');
        a.setAttribute('class', 'page-link shadow-none');
        a.textContent = '이전';

        page.appendChild(a);
        paginationLis.unshift(page);

        a.addEventListener('click', e => {
            $reviewLists.nextElementSibling.remove();
            currentPage = limitPage*pageLv - (limitPage*2-1);
            const paginationWrap = createPagination(totalPage);
            $reviewLists.after(paginationWrap);
        })
    }

    //다음 페이지 생성
    if(pageLv*limitPage < totalPage) {
        const page = document.createElement('li');
        page.setAttribute('class', 'page-item');
        const a = document.createElement('a');
        a.setAttribute('class', 'page-link shadow-none');
        a.textContent = '다음';

        page.appendChild(a);
        paginationLis.push(page);

        a.addEventListener('click', e => {
            $reviewLists.nextElementSibling.remove();
            currentPage = limitPage*pageLv + 1;
            const paginationWrap = createPagination(totalPage);
            $reviewLists.after(paginationWrap);
        })
    }

    paginationLis.forEach(ele => pagination.appendChild(ele))
    return paginationWrap;
}