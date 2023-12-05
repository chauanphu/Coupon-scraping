# Coupon-scraping

## Hướng dẫn sử dụng API

- `/login` (POST), body (username: string, password: string)
    - Nếu xảy ra lỗi hệ thống ở server: 505 (Internal server error)
    - Nếu không username hoặc password không trùng: 401 (Invalid username or password)
    - Nếu thành công: trả về token
- `/signup` (POST), body (username: string, password: string)
    - Nếu xảy ra lỗi hệ thống ở server: 505 (Internal server error)
    - Nếu username đã tồn tại: 409 (Username already taken)
    - Nếu tạo thành công: 201 (User created)
- `/shopee` (GET) query string (sortOrder = ["asc", "desc"], page: number)
    - Nếu xảy ra lỗi hệ thống ở server: 505 (Internal server error)
    - Nếu thiếu query string: 400 (Missing sortOrder or page)
    - Nếu GET thành công:
    - *page limit mặc định là 8, sort mặc định theo name*

    ![Alt text](image.png)