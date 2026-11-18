import io
import json
import unittest
import urllib.error
from unittest import mock

import diagnose_ci_failure


def make_http_error(status: int, body: bytes) -> urllib.error.HTTPError:
    return urllib.error.HTTPError(
        url="https://api.groq.com/openai/v1/chat/completions",
        code=status,
        msg="Forbidden",
        hdrs=None,
        fp=io.BytesIO(body),
    )


class FormatHttpErrorDetailTests(unittest.TestCase):
    def test_request_headers_include_expected_user_agent(self):
        response_payload = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "summary": "ok",
                                "location": "none",
                                "original_error": "none",
                                "probable_cause": "none",
                                "pr_relationship": "none",
                                "suggested_fix": "none",
                                "confidence": "high",
                                "recommended_tests": "none",
                            }
                        )
                    }
                }
            ]
        }

        class FakeResponse:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return json.dumps(response_payload).encode("utf-8")

        with mock.patch.dict(
            "os.environ",
            {"GROQ_API_KEY": "gsk_test_placeholder"},
            clear=False,
        ), mock.patch(
            "urllib.request.urlopen",
            return_value=FakeResponse(),
        ) as urlopen:
            diagnose_ci_failure.request_diagnosis("test prompt")

        request = urlopen.call_args.args[0]
        headers = {name.lower(): value for name, value in request.header_items()}
        self.assertEqual(headers["user-agent"], "precifica-ci-diagnostics/1.0")
        self.assertEqual(headers["authorization"], "Bearer gsk_test_placeholder")
        self.assertEqual(headers["content-type"], "application/json")

    def test_json_error_message(self):
        error = make_http_error(
            403,
            json.dumps({"error": {"message": "model access denied"}}).encode(),
        )

        detail = diagnose_ci_failure.format_http_error_detail(error)

        self.assertEqual(detail, "model access denied")

    def test_json_without_error_message(self):
        error = make_http_error(
            403,
            json.dumps({"error": {"code": "forbidden", "type": "permission"}}).encode(),
        )

        detail = diagnose_ci_failure.format_http_error_detail(error)

        self.assertEqual(detail, "forbidden")

    def test_non_json_response(self):
        error = make_http_error(403, b"access denied by gateway")

        detail = diagnose_ci_failure.format_http_error_detail(error)

        self.assertEqual(detail, "access denied by gateway")

    def test_api_key_is_redacted(self):
        key = "gsk_" + "x" * 24
        error = make_http_error(
            403,
            json.dumps({"error": {"message": f"invalid key {key}"}}).encode(),
        )

        detail = diagnose_ci_failure.format_http_error_detail(error)

        self.assertNotIn(key, detail)
        self.assertIn("[REDACTED_API_KEY]", detail)

    def test_authorization_header_is_redacted(self):
        error = make_http_error(
            403,
            b'{"error":{"message":"Authorization: Bearer gsk_' + b"x" * 24 + b'"}}',
        )

        detail = diagnose_ci_failure.format_http_error_detail(error)

        self.assertNotIn(b"gsk_".decode(), detail)
        self.assertIn("[REDACTED]", detail)

    def test_empty_response(self):
        error = make_http_error(403, b"")

        detail = diagnose_ci_failure.format_http_error_detail(error)

        self.assertEqual(detail, "HTTP response error")

    def test_body_read_failure_is_generic(self):
        error = make_http_error(403, b"ignored")

        def fail_read(_limit):
            raise OSError("read failed")

        error.read = fail_read

        detail = diagnose_ci_failure.format_http_error_detail(error)

        self.assertEqual(detail, "HTTP response error")

    def test_sanitization_failure_is_generic(self):
        error = make_http_error(403, b'{"error":{"message":"denied"}}')
        original_redact = diagnose_ci_failure.redact

        def fail_redact(_text, _limit):
            raise RuntimeError("sanitization failed")

        diagnose_ci_failure.redact = fail_redact
        try:
            detail = diagnose_ci_failure.format_http_error_detail(error)
        finally:
            diagnose_ci_failure.redact = original_redact

        self.assertEqual(detail, "HTTP response error")

    def test_body_read_and_detail_are_limited(self):
        error = make_http_error(403, b"x" * 10000)
        requested_limits = []
        original_read = error.read

        def bounded_read(limit):
            requested_limits.append(limit)
            return original_read(limit)

        error.read = bounded_read

        detail = diagnose_ci_failure.format_http_error_detail(error)

        self.assertEqual(requested_limits, [2048])
        self.assertLessEqual(len(detail), 500)


if __name__ == "__main__":
    unittest.main()
