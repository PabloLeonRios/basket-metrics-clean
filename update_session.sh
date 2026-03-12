sed -i -e '/{(session.sessionType === .Partido. ||/,/                 <>$/d' src/components/sessions/SessionManager.tsx
sed -i -e 's/                  <\/>//' src/components/sessions/SessionManager.tsx
sed -i -e '/                )}$/d' src/components/sessions/SessionManager.tsx
