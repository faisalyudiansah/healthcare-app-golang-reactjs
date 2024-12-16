// Code generated by mockery v2.14.0. DO NOT EDIT.

package mocks

import (
	context "context"

	entity "healthcare-app/internal/auth/entity"
	mock "github.com/stretchr/testify/mock"
)

// VerificationTokenRepository is an autogenerated mock type for the VerificationTokenRepository type
type VerificationTokenRepository struct {
	mock.Mock
}

// DeleteByUserID provides a mock function with given fields: ctx, userID
func (_m *VerificationTokenRepository) DeleteByUserID(ctx context.Context, userID int64) error {
	ret := _m.Called(ctx, userID)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64) error); ok {
		r0 = rf(ctx, userID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// FindByVerificationToken provides a mock function with given fields: ctx, token
func (_m *VerificationTokenRepository) FindByVerificationToken(ctx context.Context, token string) (*entity.VerificationToken, error) {
	ret := _m.Called(ctx, token)

	var r0 *entity.VerificationToken
	if rf, ok := ret.Get(0).(func(context.Context, string) *entity.VerificationToken); ok {
		r0 = rf(ctx, token)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*entity.VerificationToken)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, token)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Save provides a mock function with given fields: ctx, verificationToken
func (_m *VerificationTokenRepository) Save(ctx context.Context, verificationToken *entity.VerificationToken) error {
	ret := _m.Called(ctx, verificationToken)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *entity.VerificationToken) error); ok {
		r0 = rf(ctx, verificationToken)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

type mockConstructorTestingTNewVerificationTokenRepository interface {
	mock.TestingT
	Cleanup(func())
}

// NewVerificationTokenRepository creates a new instance of VerificationTokenRepository. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewVerificationTokenRepository(t mockConstructorTestingTNewVerificationTokenRepository) *VerificationTokenRepository {
	mock := &VerificationTokenRepository{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
