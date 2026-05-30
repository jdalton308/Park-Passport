"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { loadUserData, logOut, saveUserData } from "@/lib/auth";
import { getParkById, searchParks, TOTAL_PARKS } from "@/lib/parks-data";
import { formatAuthError } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <p>{message}</p>
    </div>
  );
}

export default function DashboardView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [userData, setUserData] = useState({ visited: [], wishlist: [] });
  const [filterQuery, setFilterQuery] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setDataLoading(true);
      try {
        const data = await loadUserData(user.uid);
        if (!cancelled) {
          setUserData(data);
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);

        if (!cancelled) {
          showToast(formatAuthError(error), "error");
        }
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router, showToast]);

  useEffect(() => {
    function handleBeforeUnload(event) {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const visitedCount = userData.visited.length;
  const wishlistCount = userData.wishlist.length;
  const remainingCount = TOTAL_PARKS - visitedCount;
  const percent = Math.round((visitedCount / TOTAL_PARKS) * 100);

  const visitedParks = useMemo(
    () =>
      userData.visited
        .map(getParkById)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [userData.visited]
  );

  const wishlistParks = useMemo(
    () => userData.wishlist.map(getParkById).filter(Boolean),
    [userData.wishlist]
  );

  const filteredParks = useMemo(
    () => searchParks(filterQuery),
    [filterQuery]
  );

  const updateUserData = useCallback((updater) => {
    setUserData((current) => (typeof updater === "function" ? updater(current) : updater));
    setHasUnsavedChanges(true);
  }, []);

  function handleVisitedToggle(parkId, isChecked) {
    updateUserData((current) => {
      if (isChecked) {
        return {
          visited: current.visited.includes(parkId)
            ? current.visited
            : [...current.visited, parkId],
          wishlist: current.wishlist.filter((id) => id !== parkId),
        };
      }

      return {
        ...current,
        visited: current.visited.filter((id) => id !== parkId),
      };
    });
  }

  function handleWishlistToggle(parkId) {
    if (userData.visited.includes(parkId)) return;

    updateUserData((current) => {
      if (current.wishlist.includes(parkId)) {
        return {
          ...current,
          wishlist: current.wishlist.filter((id) => id !== parkId),
        };
      }

      return {
        ...current,
        wishlist: [...current.wishlist, parkId],
      };
    });
  }

  function moveWishlistItem(parkId, direction) {
    updateUserData((current) => {
      const index = current.wishlist.indexOf(parkId);
      if (index === -1) return current;

      const nextWishlist = [...current.wishlist];

      if (direction === "up" && index > 0) {
        [nextWishlist[index - 1], nextWishlist[index]] = [
          nextWishlist[index],
          nextWishlist[index - 1],
        ];
      }

      if (direction === "down" && index < nextWishlist.length - 1) {
        [nextWishlist[index + 1], nextWishlist[index]] = [
          nextWishlist[index],
          nextWishlist[index + 1],
        ];
      }

      return { ...current, wishlist: nextWishlist };
    });
  }

  function removeFromWishlist(parkId) {
    updateUserData((current) => ({
      ...current,
      wishlist: current.wishlist.filter((id) => id !== parkId),
    }));
  }

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    try {
      await saveUserData(user.uid, userData);
      setHasUnsavedChanges(false);
      showToast("Your park list has been saved.", "success");
    } catch (error) {
      showToast(formatAuthError(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Leave without saving?");
      if (!confirmed) return;
    }

    try {
      await logOut();
      router.push("/");
    } catch (error) {
      showToast(formatAuthError(error), "error");
    }
  }

  if (authLoading || dataLoading) {
    return (
      <>
        <div className="loading-overlay">
          <div className="spinner" role="status" aria-label="Loading" />
        </div>
        <SiteHeader />
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SiteHeader userEmail={user.email} onLogout={handleLogout} />

      <main className="dashboard">
        <div className="container">
          <header className="dashboard__header">
            <h1>Your park passport</h1>
            <p className="dashboard__subtitle">
              Check off parks you&apos;ve visited, save your progress, and rank your wishlist.
            </p>

            <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
            </div>
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
              }}
            >
              {percent}% complete
            </p>
          </header>

          <div className="stats-grid">
            <div className="stat-card stat-card--highlight">
              <div className="stat-card__value">{visitedCount}</div>
              <div className="stat-card__label">Parks visited</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{wishlistCount}</div>
              <div className="stat-card__label">On wishlist</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{remainingCount}</div>
              <div className="stat-card__label">Still to explore</div>
            </div>
          </div>

          <div className="dashboard__toolbar">
            {hasUnsavedChanges && (
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-secondary)" }}>
                You have unsaved changes
              </p>
            )}
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>

          <div className="dashboard__panels">
            <section className="panel" aria-labelledby="visited-heading">
              <div className="panel__header">
                <h2 className="panel__title" id="visited-heading">
                  Visited parks
                </h2>
                <span className="panel__count">{visitedParks.length} parks</span>
              </div>
              <div className="park-list">
                {visitedParks.length === 0 ? (
                  <EmptyState
                    icon="🏔️"
                    message="No parks checked off yet. Start exploring below!"
                  />
                ) : (
                  visitedParks.map((park) => (
                    <div key={park.id} className="park-item is-visited">
                      <span className="badge badge--visited">Visited</span>
                      <div className="park-item__info">
                        <div className="park-item__name">{park.name}</div>
                        <div className="park-item__state">{park.state}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="panel" aria-labelledby="wishlist-heading">
              <div className="panel__header">
                <h2 className="panel__title" id="wishlist-heading">
                  Wishlist
                </h2>
                <span className="panel__count">{wishlistParks.length} parks</span>
              </div>
              <div className="wishlist-list">
                {wishlistParks.length === 0 ? (
                  <EmptyState
                    icon="⭐"
                    message="Add unvisited parks to your wishlist and rank your dream trips."
                  />
                ) : (
                  wishlistParks.map((park, index) => (
                    <div key={park.id} className="wishlist-item">
                      <div className="wishlist-item__rank">{index + 1}</div>
                      <div className="wishlist-item__info">
                        <div className="wishlist-item__name">{park.name}</div>
                        <div className="wishlist-item__state">{park.state}</div>
                      </div>
                      <div className="park-item__actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => moveWishlistItem(park.id, "up")}
                          disabled={index === 0}
                          aria-label={`Move ${park.name} up`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => moveWishlistItem(park.id, "down")}
                          disabled={index === wishlistParks.length - 1}
                          aria-label={`Move ${park.name} down`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => removeFromWishlist(park.id)}
                          aria-label={`Remove ${park.name} from wishlist`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="all-parks-section" aria-labelledby="all-parks-heading">
            <div className="all-parks-section__header">
              <h2 className="panel__title" id="all-parks-heading">
                All national parks
              </h2>
              <input
                type="search"
                className="filter-input"
                placeholder="Search parks or states…"
                aria-label="Filter parks"
                style={{ maxWidth: "20rem" }}
                value={filterQuery}
                onChange={(event) => setFilterQuery(event.target.value)}
              />
            </div>
            <div className="park-list park-list--all">
              {filteredParks.map((park) => {
                const isVisited = userData.visited.includes(park.id);
                const isWishlisted = userData.wishlist.includes(park.id);

                return (
                  <div
                    key={park.id}
                    className={`park-item ${isVisited ? "is-visited" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="park-item__checkbox"
                      id={`park-${park.id}`}
                      checked={isVisited}
                      onChange={(event) =>
                        handleVisitedToggle(park.id, event.target.checked)
                      }
                      aria-label={`Mark ${park.name} as visited`}
                    />
                    <label className="park-item__info" htmlFor={`park-${park.id}`}>
                      <div className="park-item__name">{park.name}</div>
                      <div className="park-item__state">{park.state}</div>
                    </label>
                    <div className="park-item__actions">
                      {isVisited && <span className="badge badge--visited">Visited</span>}
                      {!isVisited && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleWishlistToggle(park.id)}
                          aria-label={
                            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                          }
                        >
                          {isWishlisted ? "★ Wishlisted" : "☆ Wishlist"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
