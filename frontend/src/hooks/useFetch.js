import { useState, useEffect, useCallback } from "react";

// ============================================
// useFetch - 데이터 조회 전용 커스텀 훅
//
// 역할: API 호출의 반복 코드(로딩/에러/데이터 관리)를 한 곳에서 처리
//
// 사용법:
//   const { data, loading, error, refetch } = useFetch(
//     () => articleService.getArticles({ page, search }),
//     [page, search]   ← 이 값이 바뀔 때마다 자동으로 다시 요청
//   );
//
// 반환값:
//   data    - 서버에서 받은 데이터 (처음엔 null)
//   loading - 요청 중이면 true
//   error   - 에러 메시지 문자열 (없으면 null)
//   refetch - 수동으로 다시 요청하는 함수 (삭제 후 목록 갱신 등에 사용)
// ============================================

function useFetch(fetchFn, deps = []) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const run = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await fetchFn();
			setData(result);
		} catch (err) {
			// axios 에러면 서버 메시지를, 아니면 기본 메시지 사용
			const message =
				err.response?.data?.message || err.message || "요청에 실패했습니다.";
			setError(message);
		} finally {
			setLoading(false);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	useEffect(() => {
		run();
	}, [run]);

	return { data, loading, error, refetch: run };
}

export default useFetch;
